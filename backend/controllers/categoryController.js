import Category from "../models/categoryModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const createCategory = asyncHandler(async (req, res) => {
  try {
    const { name, image, parent } = req.body;

    if (!name) {
      return res.json({ error: "Name is required" });
    }

    const existingCategory = await Category.findOne({
      name,
      parent: parent || null,
    });
    if (existingCategory) {
      return res.json({ error: "Already exists under this parent" });
    }

    const category = await new Category({
      name,
      image,
      parent: parent || null,
    }).save();

    res.json(category);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { name, image, parent, isActive } = req.body; // parent ও isActive যোগ করা হলো
    const { categoryId } = req.params;

    const category = await Category.findOne({ _id: categoryId });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    category.name = name || category.name;
    category.image = image || category.image;
    category.parent = parent !== undefined ? parent : category.parent; // parent আপডেট
    category.isActive = isActive !== undefined ? isActive : category.isActive; // status আপডেট

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const removeCategory = asyncHandler(async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const hasChildren = await Category.exists({ parent: categoryId });

    if (hasChildren) {
      return res
        .status(400)
        .json({ error: "Cannot delete. This category has sub-categories." });
    }

    const removed = await Category.findByIdAndDelete(categoryId);
    res.json({ message: "Category removed", removed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const listCategory = asyncHandler(async (req, res) => {
  try {
    const all = await Category.find({}).lean();

    const buildCategoryTree = (categories, parentId = null) => {
      const categoryList = [];
      const filteredCategories = categories.filter((cat) => {
        return String(cat.parent) === String(parentId);
      });

      for (let cat of filteredCategories) {
        categoryList.push({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          isActive: cat.isActive,
          showOnHomepage: cat.showOnHomepage,
          homepageOrder: cat.homepageOrder,
          children: buildCategoryTree(categories, cat._id),
        });
      }
      return categoryList;
    };

    const categoryTree = buildCategoryTree(all);
    res.json(categoryTree);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.message);
  }
});

const readCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id });
    res.json(category);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.message);
  }
});

const getHomepageCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({
    showOnHomepage: true,
    isActive: true,
  })
    .sort({ homepageOrder: 1, createdAt: -1 })
    .limit(16);
  res.json(categories);
});


const updateCategoryFields = asyncHandler(async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const { showOnHomepage, homepageOrder } = req.body;

    if (showOnHomepage !== undefined) {
      category.showOnHomepage = showOnHomepage;
    }
    if (homepageOrder !== undefined) {
      category.homepageOrder = Number(homepageOrder) || 0;
    }

    await category.save();
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});


export {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
  getHomepageCategories, 
  updateCategoryFields,
};
