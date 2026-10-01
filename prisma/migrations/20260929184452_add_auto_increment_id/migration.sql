-- AlterTable
CREATE SEQUENCE product_id_seq;
ALTER TABLE "product" ALTER COLUMN "id" SET DEFAULT nextval('product_id_seq');
ALTER SEQUENCE product_id_seq OWNED BY "product"."id";
