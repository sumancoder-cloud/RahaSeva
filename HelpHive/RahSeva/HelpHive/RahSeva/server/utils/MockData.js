/**
 * MockData.js
 * 
 * This module provides mock data for when MongoDB is not available.
 * It simulates database functionality by storing data in memory.
 */

class MockDataStore {
  constructor() {
    // In-memory store for various collections
    this.collections = {
      users: [],
      services: [],
      bookings: [],
      wallets: [],
      emergencyServices: [],
      videoConsultations: [],
      costEstimations: [],
      communityVolunteers: [],
      communityHelpRequests: []
    };
    
    // Initialize with some default data
    this._initializeDefaultData();
    
    console.log('🧪 Mock data store initialized');
  }
  
  /**
   * Initialize collections with default data
   */
  _initializeDefaultData() {
    // Sample users
    this.collections.users = [
      {
        _id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        role: 'user',
        password: '$2a$10$eDvC7yCMkDmGmKPWMBU/hO5tMCjRvQSFQGjJvj1S4YbylLO5CmNpq', // hash for 'password123'
        isVerified: true,
        createdAt: new Date('2025-01-15')
      },
      {
        _id: 'provider1',
        name: 'Test Provider',
        email: 'provider@example.com',
        phone: '9876543211',
        role: 'helper',
        password: '$2a$10$eDvC7yCMkDmGmKPWMBU/hO5tMCjRvQSFQGjJvj1S4YbylLO5CmNpq', // hash for 'password123'
        isVerified: true,
        createdAt: new Date('2025-01-10')
      },
      {
        _id: 'admin1',
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '9876543212',
        role: 'admin',
        password: '$2a$10$eDvC7yCMkDmGmKPWMBU/hO5tMCjRvQSFQGjJvj1S4YbylLO5CmNpq', // hash for 'password123'
        isVerified: true,
        createdAt: new Date('2025-01-01')
      }
    ];
    
    // Sample services
    this.collections.services = [
      {
        _id: 'service1',
        name: 'Plumbing',
        description: 'All types of plumbing services',
        category: 'home',
        basePrice: 500,
        provider: 'provider1',
        rating: 4.5,
        isAvailable: true,
        createdAt: new Date('2025-02-01')
      },
      {
        _id: 'service2',
        name: 'Electrical Work',
        description: 'Electrical repairs and installations',
        category: 'home',
        basePrice: 700,
        provider: 'provider1',
        rating: 4.2,
        isAvailable: true,
        createdAt: new Date('2025-02-05')
      },
      {
        _id: 'service3',
        name: 'Telemedicine',
        description: 'Online doctor consultation',
        category: 'health',
        basePrice: 1000,
        provider: 'provider1',
        rating: 4.8,
        isAvailable: true,
        createdAt: new Date('2025-02-10')
      }
    ];
    
    // Sample bookings
    this.collections.bookings = [
      {
        _id: 'booking1',
        service: 'service1',
        user: 'user1',
        provider: 'provider1',
        status: 'completed',
        bookingDate: new Date('2025-08-15'),
        scheduledTime: '14:00',
        amount: 600,
        location: {
          address: '123 Main St, City',
          coordinates: [78.486671, 17.385044]
        },
        rating: 4,
        review: 'Good service',
        createdAt: new Date('2025-08-10')
      },
      {
        _id: 'booking2',
        service: 'service2',
        user: 'user1',
        provider: 'provider1',
        status: 'pending',
        bookingDate: new Date('2025-09-20'),
        scheduledTime: '10:00',
        amount: 800,
        location: {
          address: '456 Park Ave, City',
          coordinates: [78.486671, 17.385044]
        },
        createdAt: new Date('2025-09-08')
      }
    ];
    
    // Sample wallets
    this.collections.wallets = [
      {
        _id: 'wallet1',
        user: 'user1',
        balance: 1000,
        points: 150,
        transactions: [
          {
            type: 'credit',
            amount: 500,
            description: 'Referral bonus',
            date: new Date('2025-07-01')
          },
          {
            type: 'credit',
            amount: 500,
            description: 'Welcome bonus',
            date: new Date('2025-06-15')
          }
        ],
        createdAt: new Date('2025-06-15')
      },
      {
        _id: 'wallet2',
        user: 'provider1',
        balance: 5000,
        points: 300,
        transactions: [
          {
            type: 'credit',
            amount: 5000,
            description: 'Service payment',
            date: new Date('2025-08-16')
          }
        ],
        createdAt: new Date('2025-06-10')
      }
    ];
    
    // Sample emergency services
    this.collections.emergencyServices = [
      {
        _id: 'emergency1',
        user: 'user1',
        serviceType: 'plumbing',
        description: 'Pipe burst emergency',
        location: {
          address: '123 Main St, City',
          coordinates: [78.486671, 17.385044]
        },
        status: 'resolved',
        responder: 'provider1',
        createdAt: new Date('2025-08-30'),
        resolvedAt: new Date('2025-08-30')
      }
    ];
    
    // Sample video consultations
    this.collections.videoConsultations = [
      {
        _id: 'video1',
        user: 'user1',
        provider: 'provider1',
        scheduledTime: new Date('2025-09-15T10:00:00'),
        duration: 30, // minutes
        status: 'scheduled',
        paymentStatus: 'paid',
        amount: 1000,
        createdAt: new Date('2025-09-01')
      }
    ];
    
    // Sample cost estimations
    this.collections.costEstimations = [
      {
        _id: 'estimate1',
        user: 'user1',
        serviceType: 'plumbing',
        requirements: {
          issue: 'Pipe replacement',
          homeType: 'apartment',
          area: '2BHK',
          details: 'Need to replace kitchen sink pipes'
        },
        estimatedCost: {
          min: 1500,
          max: 2500,
          materials: 1000,
          labor: 1000,
          additionalCharges: 500
        },
        status: 'completed',
        createdAt: new Date('2025-09-05')
      }
    ];
    
    // Sample community volunteers
    this.collections.communityVolunteers = [
      {
        _id: 'volunteer1',
        user: 'provider1',
        name: 'Community Helper',
        skills: ['plumbing', 'electrical', 'carpentry'],
        organization: 'Helping Hands',
        isNGO: true,
        contact: {
          phone: '9876543211',
          email: 'provider@example.com',
        },
        location: {
          address: '789 Volunteer Ave, City',
          coordinates: {
            type: 'Point',
            coordinates: [78.486671, 17.385044]
          }
        },
        isActive: true,
        stats: {
          totalHelpRequests: 5,
          completedRequests: 4,
          rating: 4.8
        },
        createdAt: new Date('2025-07-01')
      }
    ];
    
    // Sample community help requests
    this.collections.communityHelpRequests = [
      {
        _id: 'help1',
        user: 'user1',
        helpType: 'plumbing',
        description: 'Need help fixing a leaking tap for an elderly neighbor',
        location: {
          address: '321 Help St, City',
          coordinates: {
            type: 'Point',
            coordinates: [78.486671, 17.385044]
          }
        },
        status: 'completed',
        volunteer: 'volunteer1',
        schedule: {
          requestedDate: new Date('2025-08-25'),
          requestedTime: '16:00',
          confirmedDate: new Date('2025-08-26'),
          confirmedTime: '17:00',
          completedAt: new Date('2025-08-26T18:30:00')
        },
        isOnSite: true,
        feedback: {
          userRating: 5,
          userReview: 'Amazing help, very kind volunteer'
        },
        createdAt: new Date('2025-08-24')
      }
    ];
  }
  
  /**
   * Helper method to generate simple UUIDs for mock data
   */
  _generateMockId(prefix = '') {
    return prefix + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Get all documents from a collection
   */
  findAll(collectionName) {
    if (!this.collections[collectionName]) {
      return Promise.resolve([]);
    }
    return Promise.resolve([...this.collections[collectionName]]);
  }
  
  /**
   * Find one document by ID
   */
  findById(collectionName, id) {
    if (!this.collections[collectionName]) {
      return Promise.resolve(null);
    }
    
    const doc = this.collections[collectionName].find(doc => doc._id === id);
    return Promise.resolve(doc || null);
  }
  
  /**
   * Find one document by filter criteria
   */
  findOne(collectionName, filter = {}) {
    if (!this.collections[collectionName]) {
      return Promise.resolve(null);
    }
    
    const doc = this.collections[collectionName].find(doc => {
      return Object.keys(filter).every(key => {
        if (typeof filter[key] === 'object' && filter[key] !== null) {
          return JSON.stringify(doc[key]) === JSON.stringify(filter[key]);
        }
        return doc[key] === filter[key];
      });
    });
    
    return Promise.resolve(doc || null);
  }
  
  /**
   * Find documents by filter criteria
   */
  find(collectionName, filter = {}) {
    if (!this.collections[collectionName]) {
      return Promise.resolve([]);
    }
    
    const docs = this.collections[collectionName].filter(doc => {
      return Object.keys(filter).every(key => {
        if (typeof filter[key] === 'object' && filter[key] !== null) {
          return JSON.stringify(doc[key]) === JSON.stringify(filter[key]);
        }
        return doc[key] === filter[key];
      });
    });
    
    return Promise.resolve([...docs]);
  }
  
  /**
   * Create a new document
   */
  create(collectionName, data) {
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = [];
    }
    
    const newDoc = {
      _id: data._id || this._generateMockId(collectionName.slice(0, 3)),
      ...data,
      createdAt: data.createdAt || new Date()
    };
    
    this.collections[collectionName].push(newDoc);
    return Promise.resolve(newDoc);
  }
  
  /**
   * Update a document
   */
  update(collectionName, id, data) {
    if (!this.collections[collectionName]) {
      return Promise.resolve(null);
    }
    
    const index = this.collections[collectionName].findIndex(doc => doc._id === id);
    if (index === -1) {
      return Promise.resolve(null);
    }
    
    // Update document but preserve _id
    this.collections[collectionName][index] = {
      ...this.collections[collectionName][index],
      ...data,
      _id: this.collections[collectionName][index]._id,
      updatedAt: new Date()
    };
    
    return Promise.resolve(this.collections[collectionName][index]);
  }
  
  /**
   * Delete a document
   */
  delete(collectionName, id) {
    if (!this.collections[collectionName]) {
      return Promise.resolve(false);
    }
    
    const initialLength = this.collections[collectionName].length;
    this.collections[collectionName] = this.collections[collectionName].filter(doc => doc._id !== id);
    
    return Promise.resolve(initialLength > this.collections[collectionName].length);
  }
}

// Create and export singleton instance
const mockDataStore = new MockDataStore();
export default mockDataStore;
