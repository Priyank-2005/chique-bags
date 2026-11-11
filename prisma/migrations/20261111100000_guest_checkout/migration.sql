-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";

-- AlterTable
ALTER TABLE "coupon_redemptions" ADD COLUMN     "email" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "accessToken" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "return_requests" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "coupon_redemptions_couponId_email_idx" ON "coupon_redemptions"("couponId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "orders_accessToken_key" ON "orders"("accessToken");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

