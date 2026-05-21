const mongoose = require('mongoose')

const STATUT_VALUES = ['En attente', 'Confirmé', 'Expédié', 'Livré', 'Annulé']

const orderSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
    },
    telephone: {
      type: String,
      required: [true, 'Le téléphone est obligatoire'],
      trim: true,
    },
    ville: {
      type: String,
      required: [true, 'La ville est obligatoire'],
      trim: true,
    },
    adresse: {
      type: String,
      required: [true, "L'adresse est obligatoire"],
      trim: true,
    },
    codePromo: {
      type: String,
      trim: true,
      default: '',
    },
    statut: {
      type: String,
      enum: STATUT_VALUES,
      default: 'En attente',
    },
  },
  {
    timestamps: true,
  },
)

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

module.exports = Order
module.exports.STATUT_VALUES = STATUT_VALUES
