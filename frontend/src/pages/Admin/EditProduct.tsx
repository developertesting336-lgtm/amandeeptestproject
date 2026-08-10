import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2, UploadCloud, X } from "lucide-react";
import "./EditProduct.css";

interface Category {
  _id: string;
  name: string;
  parent?: string | { _id: string; name: string } | null;
  isActive?: boolean;
}

interface ManufacturerState {
  name: string;
  address: string;
  country: string;
  contact: string;
  email: string;
  website: string;
}

interface WarrantyState {
  available: boolean;
  duration: string;
  unit: "days" | "months" | "years";
  type:
    | "Manufacturer Warranty"
    | "Seller Warranty"
    | "Brand Warranty"
    | "No Warranty";
  description: string;
  terms: string;
}

interface ReturnPolicyState {
  eligible: boolean;
  returnWindow: string;
  returnWindowUnit: "days" | "months";
  replacementAvailable: boolean;
  refundAvailable: boolean;
  conditions: string;
  description: string;
}

interface AttributesState {
  color: string;
  size: string;
  material: string;
  weightValue: string;
  weightUnit: "g" | "kg" | "mg" | "lb";
  length: string;
  width: string;
  height: string;
  dimUnit: "cm" | "mm" | "m" | "inch";
}

interface ProductImageItem {
  public_id?: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formatImageUrl = (image: string | ProductImageItem | undefined): string => {
  if (!image) return "";
  const rawUrl = typeof image === "string" ? image : image.url;
  if (!rawUrl) return "";
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("data:")) {
    return rawUrl;
  }
  const cleanPath = rawUrl.replace(/\\/g, "/");
  const formattedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return `${API_BASE_URL}${formattedPath}`;
};

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("0");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Manufacturer
  const [manufacturer, setManufacturer] = useState<ManufacturerState>({
    name: "",
    address: "",
    country: "",
    contact: "",
    email: "",
    website: "",
  });

  // Warranty
  const [warranty, setWarranty] = useState<WarrantyState>({
    available: false,
    duration: "",
    unit: "months",
    type: "No Warranty",
    description: "",
    terms: "",
  });

  // Return Policy
  const [returnPolicy, setReturnPolicy] = useState<ReturnPolicyState>({
    eligible: false,
    returnWindow: "",
    returnWindowUnit: "days",
    replacementAvailable: false,
    refundAvailable: false,
    conditions: "",
    description: "",
  });

  // Attributes
  const [attributes, setAttributes] = useState<AttributesState>({
    color: "",
    size: "",
    material: "",
    weightValue: "",
    weightUnit: "g",
    length: "",
    width: "",
    height: "",
    dimUnit: "cm",
  });

  // Images
  const [existingImages, setExistingImages] = useState<ProductImageItem[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [imageUrlText, setImageUrlText] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const [productResponse, categoryResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/product/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/admin/categories/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const productData = await productResponse.json();
        const categoryData = await categoryResponse.json();

        if (!productResponse.ok || !productData.success) {
          throw new Error(productData.message || "Failed to load product");
        }

        setCategories(categoryData.data || []);

        const prod = productData.data || productData.product;
        if (prod) {
          setName(prod.name || "");
          setShortDescription(prod.short_description || prod.description || "");
          setFullDescription(prod.full_description || prod.description || "");
          setHighlights(
            Array.isArray(prod.highlights) && prod.highlights.length > 0
              ? prod.highlights
              : [""]
          );

          const catId =
            typeof prod.category === "object" && prod.category !== null
              ? prod.category._id
              : prod.category || "";
          setCategory(catId);

          const subCatId =
            typeof prod.subcategory === "object" && prod.subcategory !== null
              ? prod.subcategory._id
              : prod.subcategory || "";
          setSubcategory(subCatId);

          setBrand(prod.brand || "");
          setPrice(prod.price !== undefined ? String(prod.price) : "");
          setSalePrice(prod.salePrice ? String(prod.salePrice) : "");
          setSku(prod.sku || "");
          setStock(prod.stock !== undefined ? String(prod.stock) : "0");

          if (prod.manufacturer) {
            setManufacturer({
              name: prod.manufacturer.name || "",
              address: prod.manufacturer.address || "",
              country: prod.manufacturer.country || "",
              contact: prod.manufacturer.contact || "",
              email: prod.manufacturer.email || "",
              website: prod.manufacturer.website || "",
            });
          }

          if (prod.warranty) {
            setWarranty({
              available: Boolean(prod.warranty.available),
              duration: prod.warranty.duration ? String(prod.warranty.duration) : "",
              unit: prod.warranty.unit || "months",
              type: prod.warranty.type || "No Warranty",
              description: prod.warranty.description || "",
              terms: prod.warranty.terms || "",
            });
          }

          if (prod.returnPolicy) {
            setReturnPolicy({
              eligible: Boolean(prod.returnPolicy.eligible),
              returnWindow: prod.returnPolicy.returnWindow
                ? String(prod.returnPolicy.returnWindow)
                : "",
              returnWindowUnit: prod.returnPolicy.returnWindowUnit || "days",
              replacementAvailable: Boolean(prod.returnPolicy.replacementAvailable),
              refundAvailable: Boolean(prod.returnPolicy.refundAvailable),
              conditions: prod.returnPolicy.conditions || "",
              description: prod.returnPolicy.description || "",
            });
          }

          if (prod.attributes) {
            setAttributes({
              color: prod.attributes.color || "",
              size: prod.attributes.size || "",
              material: prod.attributes.material || "",
              weightValue: prod.attributes.weight?.value
                ? String(prod.attributes.weight.value)
                : "",
              weightUnit: prod.attributes.weight?.unit || "g",
              length: prod.attributes.dimensions?.length
                ? String(prod.attributes.dimensions.length)
                : "",
              width: prod.attributes.dimensions?.width
                ? String(prod.attributes.dimensions.width)
                : "",
              height: prod.attributes.dimensions?.height
                ? String(prod.attributes.dimensions.height)
                : "",
              dimUnit: prod.attributes.dimensions?.unit || "cm",
            });
          }

          setIsFeatured(Boolean(prod.isFeatured));
          setIsActive(prod.isActive !== false);

          const formattedImgList: ProductImageItem[] = Array.isArray(prod.images)
            ? prod.images.map((img: any) =>
                typeof img === "string"
                  ? { public_id: img, url: img }
                  : {
                      public_id: img.public_id || img._id || img.url,
                      url: img.url,
                      alt: img.alt || prod.name,
                      isPrimary: Boolean(img.isPrimary),
                    }
              )
            : [];
          setExistingImages(formattedImgList);
        }
      } catch (err) {
        console.error("Load Product Edit Error:", err);
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadData();
    }
  }, [productId]);

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  // Main categories (no parent)
  const mainCategories = categories.filter((c) => !c.parent);

  // Subcategories matching selected category
  const availableSubcategories = categories.filter((c) => {
    if (!c.parent || !category) return false;
    if (typeof c.parent === "object" && c.parent !== null) {
      return c.parent._id === category;
    }
    return c.parent === category;
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const combined = [...newImages, ...files].slice(0, 10);
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setNewImages(combined);
    setNewImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 10));
    e.target.value = "";
  };

  const handleAddImageUrl = () => {
    if (!imageUrlText.trim()) return;
    setExistingImages((prev) => [
      ...prev,
      {
        public_id: `img_url_${Date.now()}`,
        url: imageUrlText.trim(),
        alt: name,
        isPrimary: prev.length === 0,
      },
    ]);
    setImageUrlText("");
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleHighlightChange = (index: number, val: string) => {
    setHighlights((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const addHighlightField = () => {
    setHighlights((prev) => [...prev, ""]);
  };

  const removeHighlightField = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!shortDescription.trim()) {
      setError("Short description is required.");
      return;
    }

    if (!fullDescription.trim()) {
      setError("Full description is required.");
      return;
    }

    if (!category) {
      setError("Please select a Category.");
      return;
    }

    if (!subcategory) {
      setError("Please select a Subcategory.");
      return;
    }

    if (!brand.trim()) {
      setError("Brand is required.");
      return;
    }

    if (!price || Number(price) < 0) {
      setError("Valid product price is required.");
      return;
    }

    if (salePrice && Number(salePrice) > Number(price)) {
      setError("Sale price cannot be greater than regular price.");
      return;
    }

    if (!sku.trim()) {
      setError("SKU is required.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      // Format images payload
      const formattedImages: Array<{
        public_id: string;
        url: string;
        alt: string;
        isPrimary: boolean;
      }> = existingImages.map((img, i) => ({
        public_id: img.public_id || `img_${i}`,
        url: typeof img === "string" ? img : img.url,
        alt: img.alt || name,
        isPrimary: i === 0,
      }));

      // Convert newly selected file images
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        formattedImages.push({
          public_id: `img_file_${Date.now()}_${i}`,
          url: dataUrl,
          alt: name,
          isPrimary: formattedImages.length === 0,
        });
      }

      const updatePayload = {
        name: name.trim(),
        short_description: shortDescription.trim(),
        full_description: fullDescription.trim(),
        highlights: highlights.filter((h) => h.trim().length > 0),
        category,
        subcategory,
        brand: brand.trim(),
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        sku: sku.trim().toUpperCase(),
        stock: Number(stock || 0),
        manufacturer: {
          name: manufacturer.name.trim(),
          address: manufacturer.address.trim(),
          country: manufacturer.country.trim(),
          contact: manufacturer.contact.trim(),
          email: manufacturer.email.trim(),
          website: manufacturer.website.trim(),
        },
        warranty: {
          available: warranty.available,
          duration: warranty.duration ? Number(warranty.duration) : null,
          unit: warranty.unit,
          type: warranty.type,
          description: warranty.description.trim(),
          terms: warranty.terms.trim(),
        },
        returnPolicy: {
          eligible: returnPolicy.eligible,
          returnWindow: returnPolicy.returnWindow
            ? Number(returnPolicy.returnWindow)
            : null,
          returnWindowUnit: returnPolicy.returnWindowUnit,
          replacementAvailable: returnPolicy.replacementAvailable,
          refundAvailable: returnPolicy.refundAvailable,
          conditions: returnPolicy.conditions.trim(),
          description: returnPolicy.description.trim(),
        },
        attributes: {
          color: attributes.color.trim(),
          size: attributes.size.trim(),
          material: attributes.material.trim(),
          weight: {
            value: attributes.weightValue ? Number(attributes.weightValue) : null,
            unit: attributes.weightUnit,
          },
          dimensions: {
            length: attributes.length ? Number(attributes.length) : null,
            width: attributes.width ? Number(attributes.width) : null,
            height: attributes.height ? Number(attributes.height) : null,
            unit: attributes.dimUnit,
          },
        },
        images: formattedImages,
        isFeatured,
        isActive,
      };

      // Construct FormData for multipart/form-data request (req.files)
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("short_description", shortDescription.trim());
      formData.append("full_description", fullDescription.trim());
      formData.append("category", category);
      formData.append("subcategory", subcategory);
      formData.append("brand", brand.trim());
      formData.append("price", String(price));
      if (salePrice) {
        formData.append("salePrice", String(salePrice));
      }
      formData.append("sku", sku.trim().toUpperCase());
      formData.append("stock", String(stock || 0));
      formData.append("isFeatured", String(isFeatured));
      formData.append("isActive", String(isActive));

      formData.append("highlights", JSON.stringify(highlights.filter((h) => h.trim().length > 0)));
      formData.append("manufacturer", JSON.stringify(updatePayload.manufacturer));
      formData.append("warranty", JSON.stringify(updatePayload.warranty));
      formData.append("returnPolicy", JSON.stringify(updatePayload.returnPolicy));
      formData.append("attributes", JSON.stringify(updatePayload.attributes));
      formData.append("existingImages", JSON.stringify(existingImages));

      newImages.forEach((file) => {
        formData.append("images", file);
      });

      let response = await fetch(
        `${API_BASE_URL}/api/admin/product/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      // Fallback try to JSON payload if server expects JSON body
      let finalRes = response;
      if (!response.ok) {
        finalRes = await fetch(
          `${API_BASE_URL}/api/admin/product/${productId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatePayload),
          }
        );
      }

      const result = await finalRes.json();

      if (!finalRes.ok || !result.success) {
        throw new Error(result.message || "Failed to update product");
      }

      setSuccess("Product updated successfully!");
      setTimeout(() => {
        navigate("/admin/products");
      }, 1200);
    } catch (err) {
      console.error("Update Product Error:", err);
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-product-page">
        <div className="edit-product-loading">
          <Loader2 size={24} className="spin" />
          <span>Loading product details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-product-page">
      {/* Header */}
      <div className="edit-product-header">
        <button
          type="button"
          className="btn-back"
          onClick={() => navigate("/admin/products")}
        >
          <ArrowLeft size={16} />
          Back to Products
        </button>

        <h2>Edit Product</h2>
      </div>

      {/* Alerts */}
      {error && <div className="edit-alert edit-alert-error">{error}</div>}
      {success && <div className="edit-alert edit-alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="edit-product-form">
        <div className="edit-form-main">
          {/* Basic Info */}
          <div className="edit-card">
            <h3 className="edit-card-title">Basic Information</h3>

            <div className="edit-group">
              <label htmlFor="edit-name">Product Name *</label>
              <input
                id="edit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="edit-group">
              <label htmlFor="edit-short-desc">Short Description *</label>
              <textarea
                id="edit-short-desc"
                maxLength={500}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                required
              />
            </div>

            <div className="edit-group">
              <label htmlFor="edit-full-desc">Full Description (HTML) *</label>
              <textarea
                id="edit-full-desc"
                rows={6}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Highlights */}
          <div className="edit-card">
            <h3 className="edit-card-title">Product Highlights</h3>
            {highlights.map((item, index) => (
              <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder={`Highlight bullet #${index + 1}`}
                  value={item}
                  onChange={(e) => handleHighlightChange(index, e.target.value)}
                  style={{ flex: 1 }}
                />
                {highlights.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHighlightField(index)}
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#dc2626",
                      borderRadius: 6,
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addHighlightField}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "8px 12px",
                borderRadius: 6,
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <Plus size={14} /> Add Highlight
            </button>
          </div>

          {/* Pricing & Stock */}
          <div className="edit-card">
            <h3 className="edit-card-title">Pricing & Stock</h3>

            <div className="edit-row">
              <div className="edit-group">
                <label htmlFor="edit-price">Regular Price ($) *</label>
                <input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="edit-group">
                <label htmlFor="edit-saleprice">Sale Price ($)</label>
                <input
                  id="edit-saleprice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                />
              </div>
            </div>

            <div className="edit-row">
              <div className="edit-group">
                <label htmlFor="edit-sku">SKU *</label>
                <input
                  id="edit-sku"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="edit-group">
                <label htmlFor="edit-stock">Stock Quantity *</label>
                <input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div className="edit-card">
            <h3 className="edit-card-title">Product Attributes</h3>

            <div className="edit-row-3">
              <div className="edit-group">
                <label>Color</label>
                <input
                  type="text"
                  value={attributes.color}
                  onChange={(e) =>
                    setAttributes((prev) => ({ ...prev, color: e.target.value }))
                  }
                />
              </div>

              <div className="edit-group">
                <label>Size</label>
                <input
                  type="text"
                  value={attributes.size}
                  onChange={(e) =>
                    setAttributes((prev) => ({ ...prev, size: e.target.value }))
                  }
                />
              </div>

              <div className="edit-group">
                <label>Material</label>
                <input
                  type="text"
                  value={attributes.material}
                  onChange={(e) =>
                    setAttributes((prev) => ({
                      ...prev,
                      material: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="edit-row">
              <div className="edit-group">
                <label>Weight Value</label>
                <input
                  type="number"
                  step="0.01"
                  value={attributes.weightValue}
                  onChange={(e) =>
                    setAttributes((prev) => ({
                      ...prev,
                      weightValue: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="edit-group">
                <label>Weight Unit</label>
                <select
                  value={attributes.weightUnit}
                  onChange={(e) =>
                    setAttributes((prev) => ({
                      ...prev,
                      weightUnit: e.target.value as any,
                    }))
                  }
                >
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="mg">Milligrams (mg)</option>
                  <option value="lb">Pounds (lb)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Warranty & Returns */}
          <div className="edit-card">
            <h3 className="edit-card-title">Warranty & Returns</h3>

            <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={warranty.available}
                onChange={(e) =>
                  setWarranty((prev) => ({ ...prev, available: e.target.checked }))
                }
              />
              <strong>Warranty Available</strong>
            </label>

            {warranty.available && (
              <div className="edit-row">
                <div className="edit-group">
                  <label>Type</label>
                  <select
                    value={warranty.type}
                    onChange={(e) =>
                      setWarranty((prev) => ({
                        ...prev,
                        type: e.target.value as any,
                      }))
                    }
                  >
                    <option value="Manufacturer Warranty">Manufacturer Warranty</option>
                    <option value="Seller Warranty">Seller Warranty</option>
                    <option value="Brand Warranty">Brand Warranty</option>
                    <option value="No Warranty">No Warranty</option>
                  </select>
                </div>

                <div className="edit-group">
                  <label>Duration & Unit</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      type="number"
                      placeholder="e.g. 12"
                      value={warranty.duration}
                      onChange={(e) =>
                        setWarranty((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                    />
                    <select
                      value={warranty.unit}
                      onChange={(e) =>
                        setWarranty((prev) => ({
                          ...prev,
                          unit: e.target.value as any,
                        }))
                      }
                    >
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="edit-form-sidebar">
          {/* Classification */}
          <div className="edit-card">
            <h3 className="edit-card-title">Classification</h3>

            <div className="edit-group">
              <label htmlFor="edit-category">Main Category *</label>
              <select
                id="edit-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory("");
                }}
                required
              >
                <option value="">Select Main Category</option>
                {mainCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="edit-group">
              <label htmlFor="edit-subcategory">Subcategory *</label>
              <select
                id="edit-subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                disabled={!category}
                required
              >
                <option value="">
                  {category ? "Select Subcategory" : "Select Category First"}
                </option>
                {availableSubcategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="edit-group">
              <label htmlFor="edit-brand">Brand *</label>
              <input
                id="edit-brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Product Images */}
          <div className="edit-card">
            <h3 className="edit-card-title">Product Images</h3>

            <div className="edit-group">
              <label>Add Image URL</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="text"
                  placeholder="https://..."
                  value={imageUrlText}
                  onChange={(e) => setImageUrlText(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: "#0f172a",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            <label className="edit-image-dropzone">
              <UploadCloud size={24} />
              <span>Choose Device Files</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                hidden
              />
            </label>

            {/* Existing & New Image Grid */}
            <div className="edit-image-grid" style={{ marginTop: 12 }}>
              {existingImages.map((img, i) => (
                <div className="edit-image-item" key={`exist_${i}`}>
                  <img src={formatImageUrl(img)} alt={`Img ${i}`} />
                  <button
                    type="button"
                    className="edit-image-remove"
                    onClick={() => removeExistingImage(i)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {newImagePreviews.map((src, i) => (
                <div className="edit-image-item" key={`new_${i}`}>
                  <img src={src} alt={`New Img ${i}`} />
                  <button
                    type="button"
                    className="edit-image-remove"
                    onClick={() => removeNewImage(i)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="edit-card">
            <h3 className="edit-card-title">Visibility</h3>

            <label className="edit-toggle">
              <span>Active in Store</span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </label>

            <label className="edit-toggle" style={{ marginTop: 8 }}>
              <span>Featured Product</span>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
            </label>
          </div>

          <button
            type="submit"
            className="btn-save"
            disabled={saving}
            style={{ width: "100%" }}
          >
            {saving ? (
              <>
                <Loader2 size={18} className="spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;