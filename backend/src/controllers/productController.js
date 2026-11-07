const { Product } = require('../models');
const { Op } = require('sequelize');
const { supabase } = require('../config/supabase');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, brand, featured, sort } = req.query;
    const whereClause = {};

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    if (brand) {
      whereClause.brand = brand;
    }

    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
      ];
    }

    let order = [['id', 'DESC']];
    if (sort === 'price-asc') {
      order = [['price', 'ASC']];
    } else if (sort === 'price-desc') {
      order = [['price', 'DESC']];
    } else if (sort === 'rating') {
      order = [['rating', 'DESC']];
    }

    const products = await Product.findAll({
      where: whereClause,
      order,
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve products.', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve product.' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, originalPrice, stock, image, images, description, brand, specs, isFeatured, warranty } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Name, category, price, and stock are required.' });
    }

    const product = await Product.create({
      name,
      category,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      stock: parseInt(stock, 10),
      image: image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      images: images || [],
      description: description || '',
      brand: brand || 'Tech',
      specs: specs || {},
      isFeatured: !!isFeatured,
      warranty: warranty || '1 Year Official Warranty (Cambodia)',
    });

    if (supabase && typeof supabase.syncProduct === 'function') {
      supabase.syncProduct(product).catch(err => console.error('[Supabase syncProduct warning]:', err.message));
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product.', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await product.update(req.body);

    if (supabase && typeof supabase.syncProduct === 'function') {
      supabase.syncProduct(product).catch(err => console.error('[Supabase syncProduct warning]:', err.message));
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await product.destroy();

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

exports.cloneProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const clonedData = {
      name: `${product.name} (Copy)`,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      image: product.image,
      images: product.images,
      description: product.description,
      brand: product.brand,
      specs: product.specs,
      isFeatured: false,
      warranty: product.warranty,
    };

    const newProduct = await Product.create(clonedData);

    return res.status(201).json({
      success: true,
      message: `Product cloned as "${newProduct.name}".`,
      product: newProduct,
    });
  } catch (error) {
    console.error('Clone product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to clone product.' });
  }
};

exports.bulkStockUpdate = async (req, res) => {
  try {
    const { delta, target } = req.body; // target: 'all', 'low', or array of IDs
    let productsToUpdate = [];

    if (Array.isArray(target)) {
      productsToUpdate = await Product.findAll({ where: { id: target } });
    } else if (target === 'low') {
      productsToUpdate = await Product.findAll({ where: { stock: { [Op.lte]: 5 } } });
    } else {
      productsToUpdate = await Product.findAll();
    }

    const added = parseInt(delta || 10, 10);
    for (const p of productsToUpdate) {
      p.stock = Math.max(0, p.stock + added);
      await p.save();
    }

    return res.status(200).json({
      success: true,
      message: `Updated stock for ${productsToUpdate.length} product(s) by ${added > 0 ? '+' : ''}${added} units.`,
      count: productsToUpdate.length,
    });
  } catch (error) {
    console.error('Bulk stock error:', error);
    return res.status(500).json({ success: false, message: 'Bulk stock update failed.' });
  }
};

exports.bulkDiscount = async (req, res) => {
  try {
    const { percentage, category, action } = req.body; // action: 'apply' or 'reset'
    const whereClause = {};
    if (category && category !== 'All') {
      whereClause.category = category;
    }

    const products = await Product.findAll({ where: whereClause });

    if (action === 'reset') {
      for (const p of products) {
        if (p.originalPrice && p.originalPrice > p.price) {
          p.price = p.originalPrice;
        }
        p.originalPrice = null;
        await p.save();
      }
      return res.status(200).json({
        success: true,
        message: `Discounts reset for ${products.length} product(s).`,
      });
    }

    const pct = parseFloat(percentage || 10) / 100;
    for (const p of products) {
      if (!p.originalPrice) {
        p.originalPrice = p.price;
      }
      p.price = Math.round(p.originalPrice * (1 - pct));
      await p.save();
    }

    return res.status(200).json({
      success: true,
      message: `Applied ${percentage || 10}% discount to ${products.length} product(s).`,
    });
  } catch (error) {
    console.error('Bulk discount error:', error);
    return res.status(500).json({ success: false, message: 'Bulk discount failed.' });
  }
};

