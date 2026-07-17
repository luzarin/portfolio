import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { asset } from '../../lib/asset'
import styles from './Navbar.module.css'

const LINKS = [
  { label: 'CV', href: asset('docs/Lucas-Blachet-DelSolar-CV.pdf') },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lucas-blachet-del-solar-11a89a261/' },
  { label: 'GitHub', href: 'https://github.com/luzarin' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth > 768) setOpen(false)
    }
    document.addEventListener('click', close)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('click', close)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.affix : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          Inicio
        </Link>
        <ul className={styles.links}>
          {LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          className={styles.burger}
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation()
            setOpen(!open)
          }}
        >
          ☰
        </button>
        {open && (
          <div ref={menuRef} className={styles.mobileMenu}>
            <ul>
              {LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mobileLink}
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  )
}
