### 2.1.4 Process Modeling

#### Use Case Diagram Description
This Use Case diagram is a graphic depiction of the interactions among the elements of the **Property Portal System (HomeHive)**. The main actors of this system are: **User (Property Seeker)** and **Admin (Property Lister)**. The relationships between and among the actors and the use cases of the system are:

*   **User (Property Seeker)**: Use cases of the User are Registering and Logging in to the system, Searching for properties with advanced filters, viewing Intelligent Weighted Recommendations, booking "Nightout" stays with dynamic BBQ and add-on selections, viewing their personal Booking History, and Updating their profile.
*   **Admin (Property Lister)**: Use cases of the Admin are Logging in, Managing property listings (Create, Read, Update, Delete), setting Dynamic Nightout Pricing for BBQ and campfire amenities, uploading and managing Property Images via Supabase, viewing a personal Dashboard to monitor listings, and managing Customer Bookings (Confirming or Cancelling requests).

#### Use Case Diagram (Mermaid)
```mermaid
useCaseDiagram
    actor "User (Property Seeker)" as User
    actor "Admin (Property Lister)" as Admin

    package HomeHive {
        usecase "Register / Login" as UC1
        usecase "Search Properties\n(Advanced Filters)" as UC2
        usecase "View Weighted\nRecommendations" as UC3
        usecase "Book 'Nightout' Stays\n(BBQ/Add-ons)" as UC4
        usecase "View Booking History" as UC5
        usecase "Update Profile" as UC6
        usecase "Manage Property\nListings (CRUD)" as UC7
        usecase "Set Dynamic Nightout\nPricing (BBQ/Campfire)" as UC8
        usecase "Upload / Manage\nProperty Images" as UC9
        usecase "View Personal\nDashboard" as UC10
        usecase "Manage Customer\nBookings (Confirm/Cancel)" as UC11
    }

    ## 2.3 Implementation
The implementation phase of the **HomeHive Property Portal System** focuses on translating the system design into a fully functional MERN stack application.

### 2.3.1 Tools Used
The following technologies were used to bridge the gap between design and deployment:
*   **MongoDB & Mongoose:** Used for the NoSQL database to store flexible property documents. Mongoose helps enforce schemas on top of MongoDB collections.
*   **Express.js & Node.js:** The core of the backend server, handling API routing, security middleware, and communication with the database.
*   **React.js & Redux Toolkit:** Powering the frontend. React handles component-based UI, while Redux manages global states like user authentication status.
*   **Firebase Authentication:** Integrated for secure, cloud-based user sign-in and Google OAuth support.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development and premium Emerald styling.

### 2.3.2 Implementation Details of Modules
After the design was made and the problems arising from the design process were clarified and dealt with, it was time to start implementing the application. Implementing an application of this scale requires a lot of resources and explaining the whole implementation process cannot be clarified in this report. However, major aspects in the implementation are described below.

#### Website Design
The design of the **HomeHive** platform was initially conceptualized using the **Figma** tool to ensure a modern and user-friendly layout. The frontend was implemented using **Visual Studio Code** as the primary Integrated Development Environment (IDE). Styling was managed through **Tailwind CSS**, a utility-first framework that allowed for rapid prototyping and a consistent "Emerald" color palette across all pages.

The actual dynamic implementation is handled by **React.js** for the frontend and **Node.js/Express.js** for the backend. In this architecture, **MongoDB** is used as the **NoSQL database** to manage property documents flexibly. JavaScript (ES6+) acts as the primary language for both client and server, where the backend processes user requests, performs weighted calculations for recommendations, and translates them into Mongoose queries to interact with the database. The results from the database are returned as JSON objects, which the React frontend then renders into interactive UI components. Since the application uses a **Layout component** to wrap every page with a consistent **Header** and **Footer**, the system provides a seamless and unified user experience throughout the property discovery process.

#### 2.3.2.1 Authentication Module (Backend & Frontend)
This module handles user security. On the backend, passwords are encrypted using **bcryptjs** before storage. On the frontend, the `SignUp` component captures data and interacts with the API.

**Backend Controller (auth.controller.js):**
```javascript
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json({ success: true, message: "User created" });
  } catch (error) {
    next(error);
  }
};
```

**Frontend Component (SignUp.jsx):**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (data.success === false) return setError(data.message);
  navigate('/signIn');
};
```

#### 2.3.2.2 Property Listing & Search Module
The search module implements server-side filtering to handle complex queries efficiently. It dynamically builds a MongoDB query object based on URL parameters, allowing for scalable filtering of thousands of listings.

**Backend Filtering Logic (listing.controller.js):**
```javascript
export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    
    // Dynamic filter construction
    let offer = req.query.offer;
    if (offer === undefined || offer === 'false') {
      offer = { $in: [false, true] };
    }

    const searchTerm = req.query.searchTerm || '';
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: 'i' }, // Case-insensitive search
      offer,
      furnished: req.query.furnished === 'true' ? true : { $in: [false, true] },
      parking: req.query.parking === 'true' ? true : { $in: [false, true] },
      type: req.query.type === 'all' ? { $in: ['sale', 'rent'] } : req.query.type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
```

#### 2.3.2.3 "Nightout" Dynamic Booking & BBQ Pricing Module
This module handles the specialized database schema for "Nightout" properties, allowing for nested configurations of BBQ rates and availability. It also includes strict backend validation to ensure that bookings for these special properties include all necessary details.

**Database Schema (listing.model.js):**
```javascript
const listingSchema = new mongoose.Schema({
  // ... basic fields ...
  bbqRates: {
    chicken: { type: Number, default: 700 },
    mutton: { type: Number, default: 2000 },
    fish: { type: Number, default: 1500 },
  },
  bbqAvailability: {
    isChickenAllowed: { type: Boolean, default: true },
    isMuttonAllowed: { type: Boolean, default: true },
    isFishAllowed: { type: Boolean, default: true },
  },
  listingSubType: { type: String, default: 'regular' } // 'regular' or 'night-stay'
}, { timestamps: true });
```

**Booking Creation Logic (booking.controller.js):**
```javascript
export const createBooking = async (req, res, next) => {
  // ... validation ...
  const booking = await Booking.create({
    propertyId,
    buyerId: req.user.id,
    date: new Date(date),
    bbqEnabled: bbqEnabled || false,
    chickenKg: chickenKg || 0,
    muttonKg: muttonKg || 0,
    totalPrice: finalTotalPrice, // Calculated on frontend, validated on payment
    status: 'pending',
  });
  return res.status(201).json({ success: true, booking });
};
```

#### 2.3.2.4 User Dashboard & Booking History
The dashboard serves as a central hub for both Property Seekers and Listers. The backend implements a unified `getBookings` controller that differentiates between "my bookings" (buyer view) and "reservations on my property" (seller view) based on a query parameter.

**Unified Booking Fetcher (booking.controller.js):**
```javascript
export const getBookings = async (req, res, next) => {
  const userId = req.user.id;
  const { type } = req.query; // 'buyer' or 'seller'

  let bookings;
  if (type === 'seller') {
    // Fetch bookings where the current user is the owner (Seller View)
    bookings = await Booking.find({ sellerId: userId }).sort({ createdAt: -1 });
  } else {
    // Fetch bookings made by the current user (Buyer View)
    bookings = await Booking.find({ buyerId: userId }).sort({ createdAt: -1 });
  }

  // Populate related data (Properties & Users) for rich UI display
  // ... population logic ...

  return res.status(200).json({ success: true, bookings });
};
```
 calculated cost, and specific add-on quantities.

### 2.2.3 Algorithm Description (Weighted Scoring Recommendation Algorithm)
The HomeHive platform features a specialized **Intelligent Property Matching Algorithm** designed to bridge the gap between user intent and available data. The algorithm follows a multi-phase execution flow to rank properties:

1.  **Phase 1: Preference Extraction & Data Normalization:**
    The system extracts user inputs from the search interface (e.g., budget, location, amenity preferences). Strings are normalized using `.toLowerCase()` and trimmed of whitespace. A "Preference Vector" is constructed to represent the user's ideal property profile.

2.  **Phase 2: Attribute Weighting (Utility Scoring):**
    Each property in the database is evaluated against the Preference Vector. The system assigns weights to five key pillars:
    *   **Price Match (30% weight):** Calculated using a distance formula: `score = 100 - (abs(targetPrice - propertyPrice) / priceRange * 100)`. Discounted properties receive a small bonus.
    *   **Location Similarity (25% weight):** Implemented using a **Word-Based Matching Algorithm**. The location string is split into tokens, and the similarity is calculated as the ratio of matching tokens to total tokens.
    *   **Amenities Match (20% weight):** Uses an intersection approach. If a user requests "BBQ" and "Parking," the score is calculated by `(matchedAmenities / requestedAmenities) * 100`.
    *   **Property Type (15% weight):** A binary check where exact matches (e.g., "Night Stay") receive full points, ensuring users see the specific category they are looking for.
    *   **Recency Bonus (10% weight):** Newer listings (based on the `createdAt` timestamp) are given a decay-based score, ensuring the platform remains dynamic and promotes fresh content.

3.  **Phase 3: Weighted Cumulative Score Calculation:**
    For every listing, a final raw score is generated using a Weighted Multi-Attribute formula. This ensures that even if a property doesn't perfectly match one criterion (like a slightly higher price), it can still rank highly if it excels in others (like the perfect location and all amenities).

4.  **Phase 4: Optimization via Quick Sort:**
    Once all properties are scored, the system applies the **Quick Sort Algorithm** ($O(n \log n)$ average complexity) to rank the listings. This ensures the recommendation engine remains fast and responsive as the listing database grows.

5.  **Phase 5: Content-Based K-Nearest Neighbors (KNN) for Similarity:**
    To power the "Similar Properties" section, the system treats property features as mathematical vectors. It finds the top $K$ properties with the shortest "distance" in the feature space relative to the target property, providing scientifically relevant "More Like This" results.
