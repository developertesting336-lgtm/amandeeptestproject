import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import cloth from "../../assets/cloth.png";
import toy from "../../assets/toy.png";
import elec from "../../assets/electronic.png";
import gros from "../../assets/gros.png";

import "./ProductSlider.css";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
}

const HeroSlide = () => {
  const products: Product[] = [
    {
      id: "1",
      name: "Clothing",
      image: cloth,
      price: 999,
    },
    {
      id: "2",
      name: "Toys",
      image: toy,
      price: 499,
    },
    {
      id: "3",
      name: "Electronics",
      image: elec,
      price: 1999,
    },
    {
      id: "4",
      name: "Groceries",
      image: gros,
      price: 799,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHoveredRef = useRef(false);
  const slideIndexRef = useRef(0);

  const maxSlide = products.length;

  const updateSlider = (index: number) => {
    if (!trackRef.current) return;

    const slides = trackRef.current.querySelectorAll<HTMLElement>(".product-slide");
    if (slides.length === 0) return;

    const newX = -slides[index].offsetLeft;

    gsap.to(trackRef.current, {
      x: newX,
      duration: 0.7,
      ease: "power2.out",
    });

    slideIndexRef.current = index;
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    const next = (slideIndexRef.current + 1) % maxSlide;
    updateSlider(next);
  };

  const prevSlide = () => {
    const prev = (slideIndexRef.current - 1 + maxSlide) % maxSlide;
    updateSlider(prev);
  };

  const goToSlide = (index: number) => {
    updateSlider(index);
  };

  // Auto-slide
  useEffect(() => {
    autoSlideRef.current = setInterval(() => {
      if (!isHoveredRef.current) {
        nextSlide();
      }
    }, 4000);

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, []);

  // Pause on hover
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
  };

  return (
    <section
      className="product-slider"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="product-slider-container">
        <div className="product-slider-track" ref={trackRef}>
          {products.map((product) => (
            <article className="product-slide" key={product.id}>
              <div className="product-slide-image">
                <img src={product.image} alt={product.name} />
              </div>

              <div className="product-slide-content">
                <h3>{product.name}</h3>

                <p>Starting from ₹{product.price}</p>

                <button type="button">Explore Collection →</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        className="slider-arrow slider-arrow-prev"
        onClick={prevSlide}
        type="button"
        aria-label="Previous slide"
      >
        ‹
      </button>

      <button
        className="slider-arrow slider-arrow-next"
        onClick={nextSlide}
        type="button"
        aria-label="Next slide"
      >
        ›
      </button>

      {/* Dots */}
      <div className="slider-dots">
        {products.map((_, index) => (
          <button
            key={index}
            className={`slider-dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => goToSlide(index)}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlide;
