// Importamos el helper que envía los eventos a Firestore
const { publishEvent } = require("./publishEvent");

/**
 * EventDispatcher
 * Centraliza todos los tipos de eventos y su estructura.
 * Permite registrar eventos de manera consistente en Firebase.
 */
class EventDispatcher {
  // Publicar un evento genérico
  static async emit(eventType, payload = {}) {
    console.log(`Despachando evento: ${eventType}`);
    await publishEvent({
      event: eventType,
      payload,
    });
  }

  //  Usuarios
  static async userRegistered(user) {
    await this.emit("UserRegistered", user);
  }

  static async userUpdated(user) {
    await this.emit("UserProfileUpdated", user);
  }

  // Productos
  static async productCreated(product) {
    await this.emit("ProductCreated", product);
  }

  static async productUpdated(product) {
    await this.emit("ProductUpdated", product);
  }

  static async productDeleted(product) {
    await this.emit("ProductDeleted", product);
  }

  // Pagos
  static async paymentInitiated(payment) {
    await this.emit("PaymentInitiated", payment);
  }

  static async paymentApproved(payment) {
    await this.emit("PaymentApproved", payment);
  }

  static async paymentFailed(payment) {
    await this.emit("PaymentFailed", payment);
  }

  //  Pedidos
  static async orderCreated(order) {
    await this.emit("OrderCreated", order);
  }

  static async orderStatusUpdated(order) {
    await this.emit("OrderStatusUpdated", order);
  }

  // Envíos
  static async shipmentCreated(shipment) {
    await this.emit("ShipmentCreated", shipment);
  }

  static async shipmentDelivered(shipment) {
    await this.emit("ShipmentDelivered", shipment);
  }

  // Descuentos
  static async discountApplied(discount) {
    await this.emit("DiscountApplied", discount);
  }
}

module.exports = { EventDispatcher };