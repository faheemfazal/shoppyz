const shopView = async (req, res) => {
    console.log("first uniettan......");
    let productlist;
    let page = null;
    let items_per_page = null;
    let total_products = null;
    const count = req.count;
    const uSer = req.User;
    const typeData = {
      typelisting: "listing",
      key: null,
    };
    if (req.query.cat) {
      try {
        productlist = await product
          .find({ category: req.query.cat })
          .populate("category");
      } catch (err) {}
      typeData.typelisting = "catlisting";
    } else if (req.query.q) {
      typeData.typelisting = "qListing";
      typeData.key = req.query.q;
      try {
        const skey = req.query.q;
  
        productlist = await product.find({ _id: skey });
      } catch (e) {}
    } else if (parseInt(req.query.page) !== 1) {
      console.log("keriooooooooooooooooooooooooooooooooooooo");
      pagination = true;
      page = parseInt(req.query.page) || 1;
      items_per_page = 6;
      console.log(items_per_page, "1111111111111111111111111111111111111");
      total_products = await product.find().countDocuments();
      productlist = await product
        .find()
        .skip((page - 1) * items_per_page)
        .limit(items_per_page);
      res.json({
        productlist,
        uSer,
        pagination,
        page,
        hasNextPage: items_per_page * page < total_products,
        pagination,
        hasPreviousPage: page > 1,
        PreviousPage: page - 1,
      });
      return;
    } else {
      console.log("nmle ethiiiiiiiiiiiiiiiii");
      pagination = true;
      page = parseInt(req.query.page) || 1;
      items_per_page = 6;
      console.log(items_per_page);
  
      total_products = await product.find().countDocuments();
      productlist = await product
        .find()
        .skip((page - 1) * items_per_page)
        .limit(items_per_page);
    }
    const categories = await category.find();
    res.render("user/shoppage", {
      productlist,
      uSer,
      categories,
      count,
      page,
      hasNextPage: items_per_page * page < total_products,
      pagination,
      hasPreviousPage: page > 1,
      PreviousPage: page - 1,
    });
  }