const { productService } = require('../services/dataService');
const { Product } = require('../models');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);

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
    const product = await productService.getProductById(id);

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

    const product = await productService.createProduct({
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
    const updated = await productService.updateProduct(id, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: updated,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);

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
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const cloned = await productService.createProduct({
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
    });

    return res.status(201).json({
      success: true,
      message: `Product cloned as "${cloned.name}".`,
      product: cloned,
    });
  } catch (error) {
    console.error('Clone product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to clone product.' });
  }
};

exports.bulkStockUpdate = async (req, res) => {
  try {
    const { delta } = req.body;
    const added = parseInt(delta || 10, 10);
    const products = await productService.getAllProducts();

    for (const p of products) {
      await productService.updateProduct(p.id, { stock: Math.max(0, p.stock + added) });
    }

    return res.status(200).json({
      success: true,
      message: `Adjusted inventory by ${added > 0 ? '+' : ''}${added} units across all catalog products.`,
    });
  } catch (error) {
    console.error('Bulk stock update error:', error);
    return res.status(500).json({ success: false, message: 'Bulk stock update failed.' });
  }
};

exports.bulkDiscount = async (req, res) => {
  try {
    const { percent } = req.body;
    const pct = parseFloat(percent || 10);
    const factor = (100 - pct) / 100;
    const products = await productService.getAllProducts();

    for (const p of products) {
      const orig = p.originalPrice || p.price;
      const newPrice = Math.round(orig * factor);
      await productService.updateProduct(p.id, {
        originalPrice: orig,
        price: newPrice,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Applied ${pct}% promotional discount across catalog products.`,
    });
  } catch (error) {
    console.error('Bulk discount error:', error);
    return res.status(500).json({ success: false, message: 'Bulk discount failed.' });
  }
};
