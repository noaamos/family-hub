CREATE TABLE "GroceryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorId" TEXT NOT NULL,
    CONSTRAINT "GroceryItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "GroceryItem" ADD CONSTRAINT "GroceryItem_creatorId_fkey"
    FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
