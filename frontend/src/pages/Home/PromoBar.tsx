import { useEffect, useState } from "react";
import "./PromoBar.css";

import adidas from "../../assets/products/promo_logo/adidas.png";
import clothImg from "../../assets/products/promo_logo/apple.png";
import grosImg from "../../assets/products/promo_logo/electronic.png";
import toyImg from "../../assets/products/promo_logo/gucci.png";
import iphoneImg from "../../assets/products/promo_logo/louis.png";
import luic from "../../assets/products/promo_logo/luic.png";
import nike from "../../assets/products/promo_logo/nike.png";
import oneplus from "../../assets/products/promo_logo/oneplus.png";
import realme from "../../assets/products/promo_logo/realme.png";
import samsung from "../../assets/products/promo_logo/samsung.png";
import uspolo from "../../assets/products/promo_logo/uspolo.png";

const HARDCODED_LOGOS = [
  adidas,
  clothImg,
  grosImg,
  toyImg,
  iphoneImg,
  luic,
  oneplus,
  nike,
  realme,
  samsung,
  uspolo
];

const PromoBar = () => {
  const [promos, setPromos] = useState<string[]>(HARDCODED_LOGOS);

  useEffect(() => {
    const fetchHomeTaglines = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/hometaglines");
        const result = await res.json();

        if (res.ok && result.success) {
          const rawTaglines =
            result.data?.taglines ||
            result.data ||
            result.taglines ||
            [];

          if (Array.isArray(rawTaglines) && rawTaglines.length > 0) {
            const fetchedImages = rawTaglines
              .map((item: any) => {
                const img = item.image || item.logo || item.icon;
                if (!img || typeof img !== "string" || img.trim().length === 0) return null;
                return img.startsWith("http")
                  ? img
                  : `http://localhost:5000${img.startsWith("/") ? "" : "/"}${img}`;
              })
              .filter((img): img is string => Boolean(img));

            if (fetchedImages.length > 0) {
              setPromos(fetchedImages);
            }
          }
        }
      } catch (err) {
        console.log("Using fallback promo logos:", err);
      }
    };

    fetchHomeTaglines();
  }, []);

  return (
    <div className="promo-bar">
      <div className="promo-track">

        <div className="promo-group">
          {promos.map((promo, index) => (
            <div className="promo-item" key={`first-${index}`}>
              <img
                src={promo}
                alt={`Brand ${index + 1}`}
                className="promo-image"
                onError={(e) => {
                  e.currentTarget.src = HARDCODED_LOGOS[index % HARDCODED_LOGOS.length];
                }}
              />
            </div>
          ))}
        </div>

        {/* Duplicate Set for Seamless Loop */}
        <div className="promo-group" aria-hidden="true">
          {promos.map((promo, index) => (
            <div className="promo-item" key={`second-${index}`}>
              <img
                src={promo}
                alt={`Brand ${index + 1}`}
                className="promo-image"
                onError={(e) => {
                  e.currentTarget.src = HARDCODED_LOGOS[index % HARDCODED_LOGOS.length];
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoBar;