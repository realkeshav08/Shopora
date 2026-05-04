import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import TrendingSection from '../components/TrendingSection'
import RecommendationSection from '../components/RecommendationSection'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'

const Home = () => {
  return (
    <div>
      <Hero/>
      <LatestCollection/>
      <BestSeller/>
      <TrendingSection/>
      <RecommendationSection/>
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Home;
