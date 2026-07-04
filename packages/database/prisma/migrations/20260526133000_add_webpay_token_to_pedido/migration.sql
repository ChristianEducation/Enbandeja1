-- AlterTable
-- Agregar campo webpayToken al modelo Pedido para correlación
-- segura entre token_ws de Webpay y el pedido correspondiente.
-- Elimina el fallback inseguro por "pedido pendiente más reciente".
ALTER TABLE "Pedido" ADD COLUMN "webpayToken" TEXT;

-- CreateIndex
-- Unique constraint para garantizar que un token no se asocie a dos pedidos.
CREATE UNIQUE INDEX "Pedido_webpayToken_key" ON "Pedido"("webpayToken");
