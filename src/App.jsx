import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Explore from './pages/Explore'
import ExploreCategory from './pages/ExploreCategory'
import MapPage from './pages/MapPage'
import Community from './pages/Community'
import CreatePost from './pages/CreatePost'
import PostDetail from './pages/PostDetail'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import PlaceDetail from './pages/PlaceDetail'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/welcome" element={<Onboarding />} />
        <Route path="/welcome/:step" element={<Onboarding />} />
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/explore/:category" element={<ExploreCategory />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/place/:slug" element={<PlaceDetail />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/new" element={<CreatePost />} />
        <Route path="/community/post/:id" element={<PostDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </>
  )
}
