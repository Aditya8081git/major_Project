const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index = async (req, res) => {
  const { q, category } = req.query; // 1. Extract 'q' from the URL query string
  let allListings;

  // 2. Check if the user actually typed something in the search bar
  if (q && q.trim() !== "") {
    allListings = await Listing.find({
      $or: [
        { title: { $regex: q.trim(),$options: "i" } },
        { location: { $regex: q.trim(),$options: "i" } },
        { country: { $regex: q.trim(),$options: "i" } },
        { category: { $regex: q.trim(),$options: "i" } },
      ],
    });

    // 3. If no listings match the search, show a flash message
    if (allListings.length === 0) {
      req.flash("error", `No listings found for "${q}"`);
      return res.redirect("/listings");
    }
  } else if (category) {
    //handle category option
    allListings = await Listing.find({
        $or: [
            { category : category},
            { title: {$regex: category, $options: "i"}},
            { description: {$regex: category, $options: "i"}},
        ],
    })
  } else {
    // 4. If no search was made, show all listings normally
    allListings = await Listing.find({});
  }

  // 5. Render the page with either the filtered listings or all listings
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res)=>{
    res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
   let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Cannot find that listing");
       return res.redirect("/listings");
    }
    res.render("listings/show",{listing});
};

module.exports.createLisitng = async (req, res)=>{
   let response =  await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send()
    
    
     let url = req.file.path;
     let filename = req.file.filename;
     const newListing = new Listing(req.body.listing);
     newListing.owner = req.user._id;
     newListing.image = { url: url, filename: filename };

     newListing.geometry = response.body.features[0].geometry;

     let savedListing = await newListing.save();
      console.log(savedListing);
     req.flash("success", "Successfully made a new listing");
     res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Cannot find that listing");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
     originalImageUrl = originalImageUrl.replace("/upload/", "/upload/w_250,c_fill/");
    res.render("listings/edit", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
   let listing =  await Listing.findByIdAndUpdate(id,{...req.body.listing});
   
   if(typeof req.file !== "undefined"){
     let url = req.file.path;
     let filename = req.file.filename;
     listing.image = { url: url, filename: filename };
     await listing.save();
   }

    req.flash("success", "Successfully updated a listing");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted a listing");
    res.redirect("/listings");
};