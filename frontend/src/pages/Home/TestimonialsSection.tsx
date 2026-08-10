import { CheckCircle } from "lucide-react";
import "./TestimonialsSection.css";

const REVIEWS = [
  {
    quote: "Extremely impressed with the quality and lightning-fast delivery! The wireless headphones exceeded all expectations in battery life.",
    name: "Aman Sharma",
    location: "Verified Buyer, Delhi",
    initial: "A",
  },
  {
    quote: "Super sleek website and seamless checkout experience. Customer service was super responsive when I inquired about sizing.",
    name: "Priya Patel",
    location: "Verified Buyer, Mumbai",
    initial: "P",
  },
  {
    quote: "Original products with genuine warranty! Got 50% discount during the flash sale and received my order within 48 hours.",
    name: "Rahul Verma",
    location: "Verified Buyer, Bangalore",
    initial: "R",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <span className="testimonials-eyebrow">WHAT OUR CUSTOMERS SAY</span>
          <h2 className="testimonials-title">Trusted by 50,000+ Happy Shoppers</h2>
        </div>

        <div className="testimonials-grid">
          {REVIEWS.map((rev, index) => (
            <div key={index} className="testimonial-card">
              <p className="testimonial-quote">"{rev.quote}"</p>

              <div className="testimonial-author-row">
                <div className="testimonial-avatar">{rev.initial}</div>
                <div className="testimonial-info">
                  <span className="testimonial-name">{rev.name}</span>
                  <span className="testimonial-role">
                    <CheckCircle size={13} color="#7fae8a" /> {rev.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
