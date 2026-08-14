
import Product from "../models/Product.js";
import Category from "../models/Category.js";



export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      stock,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;




    const filter = {
      isActive: true,
    };



    // console.log(search)
    // console.log(search.trim())

    if (search && search.trim()) {
      const searchValue = search.trim();
      const escapedSearch = searchValue.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

      const matchingCategories = await Category.find({
        name: { $regex: escapedSearch, $options: "i" },
        isActive: true,
      }).select("_id");

      const categoryIds = matchingCategories.map((c) => c._id);

      filter.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          brand: {
            // $regex: escapedSearch,
            $regex: `\\b${escapedSearch}`,
            $options: "i",
          },
        },
      ];

      if (categoryIds.length > 0) {
        filter.$or.push({
          category: { $in: categoryIds },
        });
      }
    }

    if (category && category !== "all") {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
      const cleanCategoryName = category.replace(/[-_]/g, " ").trim();
      const escapedCategory = cleanCategoryName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

      const categoryDoc = await Category.findOne({
        $or: [
          ...(isObjectId ? [{ _id: category }] : []),
          { name: { $regex: escapedCategory, $options: "i" } },
          { slug: category.toLowerCase() },
          { slug: cleanCategoryName.toLowerCase().replace(/\s+/g, "-") },
        ],
        isActive: true,
      }).select("_id");

      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        filter.$or = [
          { categoryName: { $regex: escapedCategory, $options: "i" } },
          { "category.name": { $regex: escapedCategory, $options: "i" } },
        ];
      }
    }



    if (subcategory) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(subcategory);
      const escapedSubcat = subcategory.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

      const subcategoryDoc = await Category.findOne({
        $or: [
          ...(isObjectId ? [{ _id: subcategory }] : []),
          { name: { $regex: `^${escapedSubcat}$`, $options: "i" } },
          { slug: subcategory.toLowerCase() },
        ],
        parent: { $ne: null },
        isActive: true,
      }).select("_id parent");

      if (!subcategoryDoc) {
        return res.status(400).json({
          success: false,
          message: "Subcategory not found",
        });
      }

      if (
        filter.category &&
        String(subcategoryDoc.parent) !==
        String(filter.category)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Selected subcategory does not belong to the selected category",
        });
      }

      filter.subcategory = subcategoryDoc._id;
    }



    if (brand && brand.trim()) {
      const escapedBrand = brand.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      filter.brand = {
        $regex: `\\b${escapedBrand}`,
        $options: "i",
      };
    }


    // =================================================
    // PRICE FILTER
    // =================================================

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined && minPrice !== "") {
        const minimum = Number(minPrice);

        if (isNaN(minimum) || minimum < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid minimum price",
          });
        }

        filter.price.$gte = minimum;
      }

      if (maxPrice !== undefined && maxPrice !== "") {
        const maximum = Number(maxPrice);

        if (isNaN(maximum) || maximum < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid maximum price",
          });
        }

        filter.price.$lte = maximum;
      }

      // Make sure minPrice is not greater than maxPrice
      if (
        filter.price.$gte !== undefined &&
        filter.price.$lte !== undefined &&
        filter.price.$gte > filter.price.$lte
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Minimum price cannot be greater than maximum price",
        });
      }
    }


    // =================================================
    // STOCK FILTER
    // =================================================

    if (stock === "inStock") {
      filter.stock = {
        $gt: 0,
      };
    }

    if (stock === "outOfStock") {
      filter.stock = 0;
    }


    // =================================================
    // SORTING
    // =================================================

    let sortOption = {};

    switch (sort) {
      case "price_asc":
      case "price-low":
        sortOption = {
          price: 1,
        };
        break;

      case "price_desc":
      case "price-high":
        sortOption = {
          price: -1,
        };
        break;

      case "name_asc":
      case "name":
        sortOption = {
          name: 1,
        };
        break;

      case "name_desc":
        sortOption = {
          name: -1,
        };
        break;

      case "oldest":
        sortOption = {
          createdAt: 1,
        };
        break;

      case "featured":
      case "newest":
      default:
        sortOption = {
          createdAt: -1,
        };
        break;
    }


    // =================================================
    // PAGINATION
    // =================================================

    let currentPage = Number(page);
    let perPage = Number(limit);

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1
    ) {
      currentPage = 1;
    }

    if (
      !Number.isInteger(perPage) ||
      perPage < 1
    ) {
      perPage = 12;
    }

    // Prevent very large requests
    if (perPage > 100) {
      perPage = 100;
    }

    const skip =
      (currentPage - 1) * perPage;


    // =================================================
    // QUERY
    // =================================================

    const [products, totalProducts] =
      await Promise.all([
        Product.find(filter)
          .select(
            [
              "name",
              "short_description",
              "price",
              "salePrice",
              "images",
              "brand",
              "stock",
              "sku",
              "highlights",
              "category",
              "subcategory",
              "isFeatured",
              "createdAt",
            ].join(" ")
          )
          .populate(
            "category",
            "name"
          )
          .populate(
            "subcategory",
            "name"
          )
          .sort(sortOption)
          .skip(skip)
          .limit(perPage)
          .lean(),

        Product.countDocuments(filter),
      ]);


    // =================================================
    // PAGINATION INFORMATION
    // =================================================

    const totalPages = Math.ceil(
      totalProducts / perPage
    );


    // =================================================
    // RESPONSE
    // =================================================

    // console.log(products)

    return res.status(200).json({
      success: true,

      data: {
        products,

        pagination: {
          currentPage,
          perPage,
          totalProducts,
          totalPages,

          hasNextPage:
            currentPage < totalPages,

          hasPreviousPage:
            currentPage > 1,
        },
      },
    });

  } catch (error) {
    console.error(
      "Get Products Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

