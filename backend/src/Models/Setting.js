const mongoose = require('mongoose')

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'homepage',
      immutable: true,
      unique: true,
    },
    hero: {
      badgeText: {
        type: String,
        default: 'NOUVEAU PACK',
        trim: true,
      },
      title: {
        type: String,
        default: "L'ÉLÉGANCE au naturel",
        trim: true,
      },
      description: {
        type: String,
        default:
          'Blush framboise & Musc Tahara. Le duo essentiel pour révéler votre beauté, chaque jour.',
        trim: true,
      },
      image: {
        type: String,
        default: '',
        trim: true,
      },
    },
    bestSeller: {
      badgeText: {
        type: String,
        default: 'BEST SELLER',
        trim: true,
      },
      name: {
        type: String,
        default: 'Pack Yanglam',
        trim: true,
      },
      price: {
        type: Number,
        default: 229,
        min: 0,
      },
      description: {
        type: String,
        default:
          'Blush Framboise Naturel, Musc Tahara 100% Original, longue tenue et parfum élégant.',
        trim: true,
      },
      image: {
        type: String,
        default: '',
        trim: true,
      },
      features: {
        type: [String],
        default: [
          'Blush naturel, sans taches',
          'Effet bonne mine instantané',
          'Musc tahara, parfum propre et élégant',
          'Parfum qui reste même après la douche',
        ],
      },
    },
    beforeAfter: {
      title: {
        type: String,
        default: 'EFFET NATUREL EN QUELQUES SECONDES',
        trim: true,
      },
      pairs: {
        type: [
          {
            beforeLabel: {
              type: String,
              default: 'AVANT',
              trim: true,
            },
            beforeImage: {
              type: String,
              default: '',
              trim: true,
            },
            afterLabel: {
              type: String,
              default: 'APRES',
              trim: true,
            },
            afterImage: {
              type: String,
              default: '',
              trim: true,
            },
          },
        ],
        default: [
          { beforeLabel: 'AVANT', beforeImage: '', afterLabel: 'APRES', afterImage: '' },
          { beforeLabel: 'AVANT', beforeImage: '', afterLabel: 'APRES', afterImage: '' },
        ],
      },
    },
    testimonials: {
      title: {
        type: String,
        default: 'ELLES ONT ADOPTE YANGLAM',
        trim: true,
      },
      items: {
        type: [
          {
            name: {
              type: String,
              default: '',
              trim: true,
            },
            text: {
              type: String,
              default: '',
              trim: true,
            },
          },
        ],
        default: [
          {
            name: 'Sara L.',
            text: "Le musc tahara est juste incroyable, l'odeur reste toute la journee meme apres la douche !",
          },
          {
            name: 'Meryem B.',
            text: "Le blush donne un effet bonne mine naturel, sans taches. J'adore !",
          },
          {
            name: 'Imane K.',
            text: 'Pack complet a prix abordable, ideal pour moi et comme idee cadeau.',
          },
        ],
      },
    },
    instagram: {
      title: {
        type: String,
        default: 'REJOIGNEZ-NOUS SUR INSTAGRAM',
        trim: true,
      },
      handle: {
        type: String,
        default: '@YANGLAM',
        trim: true,
      },
      buttonText: {
        type: String,
        default: 'SUIVRE @YANGLAM',
        trim: true,
      },
      images: {
        type: [
          {
            image: {
              type: String,
              default: '',
              trim: true,
            },
            alt: {
              type: String,
              default: '',
              trim: true,
            },
          },
        ],
        default: [
          { image: '', alt: 'Pack Yanglam dans son coffret' },
          { image: '', alt: 'Blush Yanglam framboise' },
          { image: '', alt: 'Produit Yanglam sur Instagram' },
          { image: '', alt: 'Routine beaute Yanglam' },
          { image: '', alt: 'Inspiration beaute Yanglam' },
        ],
      },
    },
    display: {
      showNavbar: {
        type: Boolean,
        default: false,
      },
      showFooter: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.models.Setting || mongoose.model('Setting', settingSchema)
