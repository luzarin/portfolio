import { Suspense } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { Spinner } from './components/common/Spinner'
import { projectPages } from './pages/registry'
import HomePage from './pages/HomePage'

function ProjectRoute() {
  const { slug } = useParams()
  const Page = slug ? projectPages[slug] : undefined
  if (!Page) return <Navigate to="/" replace />
  return <Page />
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/proyectos/:slug" element={<ProjectRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
