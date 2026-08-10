import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import "./NewsletterSection.css";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        <span className="newsletter-eyebrow">JOIN OUR VIP INSIDER CLUB</span>
        <h2 className="newsletter-title">Get 15% OFF Your First Purchase</h2>
        <p className="newsletter-desc">
          Subscribe to our exclusive newsletter to receive early access to new drops, secret discount codes, and curated style recommendations.
        </p>

        {subscribed ? (
          <div style={{ color: "#7fae8a", fontWeight: 600, fontSize: "16px", padding: "10px" }}>
            <CheckCircle2 size={24} style={{ verticalAlign: "middle", marginRight: "8px" }} />
            Thank you for subscribing! Your 15% promo code is <strong>WELCOME15</strong>.
          </div>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn">
              Subscribe <Send size={15} />
            </button>
          </form>
        )}

        <div className="newsletter-perks">
          <span>✓ Instant Code</span>
          <span>✓ No Spam Guarantee</span>
          <span>✓ Unsubscribe Anytime</span>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
