"""Shopora recommendation engine.

A content-based + collaborative-filtering recommender.

Strategies
----------
* Similar products      -> TF-IDF cosine similarity blended with category /
                           price / bestseller rules (content-based).
* Frequently bought     -> order co-occurrence counts (collaborative).
* Personalized picks    -> a weighted profile of the user's purchase history.
* Trending now          -> most-ordered products in a recent time window.
* Admin analytics       -> trending counts and top co-purchased pairs.
"""

from datetime import datetime, timedelta

from .text_model import TfidfModel


def _oid(item: dict) -> str:
    """Extract a product id from an order line item (`_id` or `id`)."""
    return str(item.get("_id") or item.get("id") or "")


class RecommendationEngine:
    """Build once per request from the current products + orders snapshot."""

    def __init__(self, products: list[dict], orders: list[dict]):
        self.products = products
        self.orders = orders
        self.by_id = {p["_id"]: p for p in products}
        self._build_content_model()

    # ------------------------------------------------------------------ #
    # Content model
    # ------------------------------------------------------------------ #
    def _build_content_model(self) -> None:
        """Fit a TF-IDF cosine-similarity model over the product catalogue."""
        self.text_model: TfidfModel | None = None
        self.index: dict[str, int] = {}
        if not self.products:
            return

        # subCategory is repeated to give it extra weight in the text signal.
        corpus = [
            f"{p.get('name', '')} {p.get('description', '')} "
            f"{p.get('category', '')} "
            f"{p.get('subCategory', '')} {p.get('subCategory', '')}"
            for p in self.products
        ]
        self.text_model = TfidfModel(corpus)
        self.index = {p["_id"]: i for i, p in enumerate(self.products)}

    @staticmethod
    def _available(p: dict) -> bool:
        return p.get("available") is not False

    # ------------------------------------------------------------------ #
    # Similar products (content-based)
    # ------------------------------------------------------------------ #
    def similar(self, product_id: str, top_n: int = 6) -> list[dict] | None:
        ref = self.by_id.get(product_id)
        if ref is None:
            return None

        ref_i = self.index.get(product_id)
        ref_price = ref.get("price") or 1
        scored = []

        for i, p in enumerate(self.products):
            if p["_id"] == product_id or not self._available(p):
                continue

            score = 0.0
            # ML signal: text cosine similarity (scaled into the rule range).
            if ref_i is not None and self.text_model is not None:
                score += self.text_model.similarity(ref_i, i) * 5

            # Rule signals.
            if p.get("category") == ref.get("category"):
                score += 2
            if p.get("subCategory") == ref.get("subCategory"):
                score += 3
            price_diff = abs((p.get("price", 0) - ref.get("price", 0)) / ref_price)
            if price_diff <= 0.3:
                score += 2
            elif price_diff <= 0.6:
                score += 1
            if p.get("bestseller"):
                score += 1

            scored.append((score, p))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in scored[:top_n]]

    # ------------------------------------------------------------------ #
    # Frequently bought together (collaborative)
    # ------------------------------------------------------------------ #
    def bought_together(self, product_id: str, top_n: int = 6) -> tuple[list[dict], bool]:
        co_occurrence: dict[str, int] = {}
        for order in self.orders:
            ids = [i for i in (_oid(it) for it in order.get("items", [])) if i]
            if product_id not in ids:
                continue
            for i in ids:
                if i != product_id:
                    co_occurrence[i] = co_occurrence.get(i, 0) + 1

        ranked = sorted(co_occurrence.items(), key=lambda x: x[1], reverse=True)
        products = [
            self.by_id[i]
            for i, _ in ranked
            if i in self.by_id and self._available(self.by_id[i])
        ]

        # Fall back to same-category products when co-occurrence data is thin.
        if len(products) < 2:
            ref = self.by_id.get(product_id)
            fallback = [
                p for p in self.products
                if ref
                and p.get("category") == ref.get("category")
                and p["_id"] != product_id
                and self._available(p)
            ]
            return fallback[:top_n], True

        return products[:top_n], False

    # ------------------------------------------------------------------ #
    # Personalized picks
    # ------------------------------------------------------------------ #
    def personalized(self, user_id: str, top_n: int = 8) -> tuple[list[dict], str]:
        user_orders = [o for o in self.orders if str(o.get("userId")) == str(user_id)]

        if not user_orders:
            popular = [
                p for p in self.products if p.get("bestseller") and self._available(p)
            ]
            return popular[:top_n], "popular"

        purchased: set[str] = set()
        category_score: dict[str, int] = {}
        sub_score: dict[str, int] = {}
        for order in user_orders:
            for it in order.get("items", []):
                i = _oid(it)
                if i:
                    purchased.add(i)
                if it.get("category"):
                    category_score[it["category"]] = category_score.get(it["category"], 0) + 1
                if it.get("subCategory"):
                    sub_score[it["subCategory"]] = sub_score.get(it["subCategory"], 0) + 1

        scored = []
        for p in self.products:
            if not self._available(p) or p["_id"] in purchased:
                continue
            score = (
                category_score.get(p.get("category"), 0) * 2
                + sub_score.get(p.get("subCategory"), 0) * 3
                + (1 if p.get("bestseller") else 0)
            )
            if score > 0:
                scored.append((score, p))

        scored.sort(key=lambda x: x[0], reverse=True)
        recommended = [p for _, p in scored[:top_n]]

        # Top up with bestsellers if the profile produced too few picks.
        if len(recommended) < 4:
            used = {p["_id"] for p in recommended} | purchased
            extra = [
                p for p in self.products
                if p.get("bestseller") and self._available(p) and p["_id"] not in used
            ]
            recommended += extra[: top_n - len(recommended)]

        return recommended, "personalized"

    # ------------------------------------------------------------------ #
    # Trending
    # ------------------------------------------------------------------ #
    def _recent_counts(self, days: int) -> tuple[dict[str, int], int]:
        """Per-product order quantity within `days`, plus the recent-order count."""
        cutoff = datetime.utcnow() - timedelta(days=days)
        counts: dict[str, int] = {}
        recent_orders = 0
        for order in self.orders:
            date = order.get("date")
            if isinstance(date, datetime) and date < cutoff:
                continue
            recent_orders += 1
            for it in order.get("items", []):
                i = _oid(it)
                if i:
                    counts[i] = counts.get(i, 0) + (it.get("quantity") or 1)
        return counts, recent_orders

    def trending(self, top_n: int = 8, days: int = 30) -> tuple[list[dict], str]:
        counts, _ = self._recent_counts(days)
        ranked = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        products = [
            self.by_id[i]
            for i, _ in ranked
            if i in self.by_id and self._available(self.by_id[i])
        ]

        # Fall back to newest arrivals when trending data is thin.
        if len(products) < 3:
            newest = sorted(
                [p for p in self.products if self._available(p)],
                key=lambda p: p.get("date", 0),
                reverse=True,
            )
            return newest[:top_n], "new"

        return products[:top_n], "trending"

    # ------------------------------------------------------------------ #
    # Admin analytics
    # ------------------------------------------------------------------ #
    def trending_analytics(self, top_n: int = 10, days: int = 30) -> tuple[list[dict], int]:
        counts, recent_orders = self._recent_counts(days)
        ranked = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:top_n]
        result = [
            {"product": self.by_id[i], "orderCount": c}
            for i, c in ranked
            if i in self.by_id
        ]
        return result, recent_orders

    def copurchase_analytics(self, top_n: int = 10) -> list[dict]:
        pair_counts: dict[tuple[str, str], int] = {}
        for order in self.orders:
            ids = sorted({i for i in (_oid(it) for it in order.get("items", [])) if i})
            for a in range(len(ids)):
                for b in range(a + 1, len(ids)):
                    key = (ids[a], ids[b])
                    pair_counts[key] = pair_counts.get(key, 0) + 1

        ranked = sorted(pair_counts.items(), key=lambda x: x[1], reverse=True)[:top_n]
        result = []
        for (id1, id2), count in ranked:
            p1, p2 = self.by_id.get(id1), self.by_id.get(id2)
            if p1 and p2:
                result.append({"product1": p1, "product2": p2, "count": count})
        return result
