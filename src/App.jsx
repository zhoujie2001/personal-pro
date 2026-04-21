import { useEffect, useRef, useState } from 'react'
import MusicPlayer from './MusicPlayer'

export default function App() {
  const sliderRef = useRef(null)
  const [activePhoto, setActivePhoto] = useState(null)

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    let scrollAmount = 0
    let animationFrame
    const speed = 0.5

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setActivePhoto(null)
      }
    }

    const scroll = () => {
      scrollAmount += speed
      slider.scrollLeft = scrollAmount
      if (scrollAmount >= slider.scrollWidth / 2) {
        scrollAmount = 0
        slider.scrollLeft = 0
      }
      animationFrame = requestAnimationFrame(scroll)
    }

    const stop = () => cancelAnimationFrame(animationFrame)
    const start = () => {
      animationFrame = requestAnimationFrame(scroll)
    }

    animationFrame = requestAnimationFrame(scroll)
    window.addEventListener('keydown', handleEsc)
    slider.addEventListener('mouseenter', stop)
    slider.addEventListener('mouseleave', start)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('keydown', handleEsc)
      slider.removeEventListener('mouseenter', stop)
      slider.removeEventListener('mouseleave', start)
    }
  }, [])

  const books = [
    { title: '霍乱时期的爱情', year: '2024' },
    { title: '花街往事', year: '2024' },
    { title: '献给阿尔吉侬的花束', year: '2024' },
    { title: '花开不败', year: '2024' },
    { title: '挪威的森林', year: '2024' },
    { title: '麦田里的守望者', year: '2024' },
    { title: '1988：我想和这个世界谈谈', year: '2024' },
    { title: '草民', year: '2024' },
    { title: '命运', year: '2024' },
    { title: '少年巴比伦', year: '2024' },
    { title: '追随她的旅程', year: '2024' },
  ]

  const photos = [
    { src: 'images/photo1.jpg', title: '星星上开满了花', desc: '成都 · 2023' },
    { src: 'images/photo2.jpg', title: '平潭一角', desc: '平潭 · 2024' },
    { src: 'images/photo3.jpg', title: '嘿，抬头', desc: '成都 · 2023' },
    { src: 'images/photo4.jpg', title: '马里冷旧', desc: '峨眉 · 2024' },
    { src: 'images/photo5.jpg', title: '风车&海田', desc: '平潭 · 2024' },
    { src: 'images/photo6.jpg', title: '沉思', desc: '平潭 · 2024' },
    { src: 'images/photo7.jpg', title: '你看那边', desc: '平潭 · 2024' },
    { src: 'images/photo8.jpg', title: '风车', desc: '平潭 · 2024' },
    { src: 'images/photo9.jpg', title: '修狗们', desc: '成都 · 2022' },
    { src: 'images/photo10.jpg', title: '日落', desc: '成都 · 2023' },
    { src: 'images/photo11.jpg', title: '你谁？', desc: '成都 · 2018' },
    { src: 'images/photo12.jpg', title: '傍晚', desc: '昆明 · 2024' },
    { src: 'images/photo13.jpg', title: '群山', desc: '川西 · 2024' },
    { src: 'images/photo14.jpg', title: '矮油，不错哦', desc: '海口 · 2024' },
    { src: 'images/photo16.jpg', title: '氧气', desc: '川西 · 2024' },
    { src: 'images/photo17.jpg', title: '苍山浮在洱海上', desc: '大理 · 2024' },
    { src: 'images/photo18.jpg', title: '燥热的空气', desc: '海南某处 · 2024' },
    { src: 'images/photo19.jpg', title: '境', desc: '鱼子西 · 2024' },
    { src: 'images/photo20.jpg', title: '快拍', desc: '鱼子西 · 2024' },
    { src: 'images/photo21.jpg', title: '新疆？', desc: '随机点 · 2024' },
    { src: 'images/photo22.jpg', title: '门缝里看鸥', desc: '昆明 · 2024' },
    { src: 'images/photo23.jpg', title: '翠湖', desc: '昆明 · 2024' },
    { src: 'images/photo24.jpg', title: '下一秒即将开抢的牛仔', desc: '昆明 · 2024' },
    { src: 'images/photo25.jpg', title: '呔', desc: '昆明 · 2024' },
    { src: 'images/photo26.jpg', title: '你贵，但值', desc: '昆明 · 2024' },
    { src: 'images/photo27.jpg', title: '你见到小王子了吗', desc: '鱼子西 · 2024' },
    { src: 'images/photo28.jpg', title: '威猛猛兽_Ariza', desc: '成都 · 2024' },
    { src: 'images/photo29.jpg', title: '小家伙', desc: '成都 · 2024' },
    { src: 'images/photo30.jpg', title: '日出', desc: '鱼子西 · 2024' },
    { src: 'images/photo31.jpg', title: '蔑', desc: 'Home · 2024' },
  ]

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>周杰 / Dylan</h2>
        <nav>
          <a href="#about">About</a>
          <a href="#reading">Reading</a>
          <a href="#travel">Travel</a>
          <a href="#photography">Photography</a>
          <a href="#playlist">Playlist</a>
          <a href="#links">Links</a>
        </nav>
      </aside>

      <main className="content">
        <section id="about">
          <h1>周杰 / Dylan</h1>
          <p className="subtitle">A pessimist in the third quadrant, yet passionate about movement.</p>
          <p>因为天气好，因为天气不好，因为天气感刚好。现居成都。</p>
        </section>

        <section id="reading">
          <h2>Reading_favorite</h2>
          <div className="div_books">
            <ul className="hanging-list">
              {books.map((book) => (
                <li key={`${book.year}-${book.title}`}>
                  <span className="year">{book.year}</span>
                  《{book.title}》
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="travel">
          <h2>Travel</h2>
          <p>嘿！快看那边。</p>
          <div className="slider-wrapper" ref={sliderRef}>
            <div className="video-track">
              {[1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10].map((num, index) => (
                <video
                  key={`${num}-${index}`}
                  src={`videos/travel${num}.mp4`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                />
              ))}
            </div>
          </div>
        </section>

        <section id="photography">
          <h2>Photography</h2>
          <h2>myCut</h2>
          <div className="photo-grid">
            {photos.map((item) => (
              <div className="photo-card" key={item.src} onClick={() => setActivePhoto(item)}>
                <div className="photo-img-wrapper">
                  <img src={item.src} alt={item.title} />
                </div>
                <div className="photo-info">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {activePhoto && (
            <div className="lightbox" onClick={() => setActivePhoto(null)}>
              <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                <button className="lightbox-close" onClick={() => setActivePhoto(null)}>×</button>
                <img src={activePhoto.src} alt={activePhoto.title} />
                <div className="lightbox-caption">
                  <h3>{activePhoto.title}</h3>
                  <p>{activePhoto.desc}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section id="playlist">
          <h2>Playlist</h2>
          <MusicPlayer />
        </section>

        <section id="links">
          <h2>Links</h2>
          <ul className="links">
            <li>📧 <a href="mailto:zhou.1900@jiyunhudong.com">zhou.1900@jiyunhudong.com</a></li>
            <li>🔗 <a href="https://v.douyin.com/VWYUIrtxV2Y/" target="_blank" rel="noreferrer">Douyin</a></li>
            <li>🔗 <a href="https://www.douban.com/people/269994208/" target="_blank" rel="noreferrer">Douban</a></li>
            <li>🔗 <a href="https://xhslink.com/m/39qXQZqVMys" target="_blank" rel="noreferrer">Xiaohongshu</a></li>
          </ul>
        </section>
      </main>
    </div>
  )
}
