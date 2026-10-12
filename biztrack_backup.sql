--
-- PostgreSQL database dump
--

\restrict ifine1Wa3dXd9gRsP2BNsRRfOgdHp8q5cxLQ7SH2BnqC3OjqltFS2npJXOsp33l

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: prisma_contract; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA prisma_contract;


ALTER SCHEMA prisma_contract OWNER TO postgres;

--
-- Name: InventoryMovementType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InventoryMovementType" AS ENUM (
    'IN',
    'OUT'
);


ALTER TYPE public."InventoryMovementType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: contract; Type: TABLE; Schema: prisma_contract; Owner: postgres
--

CREATE TABLE prisma_contract.contract (
    core_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    contract_json jsonb NOT NULL
);


ALTER TABLE prisma_contract.contract OWNER TO postgres;

--
-- Name: ledger; Type: TABLE; Schema: prisma_contract; Owner: postgres
--

CREATE TABLE prisma_contract.ledger (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    space text NOT NULL,
    migration_name text NOT NULL,
    migration_hash text NOT NULL,
    origin_core_hash text,
    origin_profile_hash text,
    destination_core_hash text NOT NULL,
    destination_profile_hash text,
    operations jsonb NOT NULL
);


ALTER TABLE prisma_contract.ledger OWNER TO postgres;

--
-- Name: ledger_id_seq; Type: SEQUENCE; Schema: prisma_contract; Owner: postgres
--

CREATE SEQUENCE prisma_contract.ledger_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE prisma_contract.ledger_id_seq OWNER TO postgres;

--
-- Name: ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: prisma_contract; Owner: postgres
--

ALTER SEQUENCE prisma_contract.ledger_id_seq OWNED BY prisma_contract.ledger.id;


--
-- Name: marker; Type: TABLE; Schema: prisma_contract; Owner: postgres
--

CREATE TABLE prisma_contract.marker (
    space text DEFAULT 'app'::text NOT NULL,
    core_hash text NOT NULL,
    profile_hash text NOT NULL,
    contract_json jsonb,
    canonical_version integer,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    app_tag text,
    meta jsonb DEFAULT '{}'::jsonb NOT NULL,
    invariants text[] DEFAULT '{}'::text[] NOT NULL
);


ALTER TABLE prisma_contract.marker OWNER TO postgres;

--
-- Name: Expense; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Expense" (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    amount numeric NOT NULL,
    "expenseDate" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    category character varying(50) DEFAULT 'OTHER'::character varying NOT NULL
);


ALTER TABLE public."Expense" OWNER TO postgres;

--
-- Name: Expense_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Expense_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Expense_id_seq" OWNER TO postgres;

--
-- Name: Expense_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Expense_id_seq" OWNED BY public."Expense".id;


--
-- Name: Inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Inventory" (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Inventory" OWNER TO postgres;

--
-- Name: Inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Inventory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Inventory_id_seq" OWNER TO postgres;

--
-- Name: Inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Inventory_id_seq" OWNED BY public."Inventory".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(255),
    description character varying(255),
    created_at timestamp(6) with time zone,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_movements (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    quantity integer NOT NULL,
    type public."InventoryMovementType" NOT NULL,
    reference text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inventory_movements OWNER TO postgres;

--
-- Name: inventory_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_movements_id_seq OWNER TO postgres;

--
-- Name: inventory_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_movements_id_seq OWNED BY public.inventory_movements.id;


--
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    id integer NOT NULL,
    name character varying(255),
    sku character varying(255) NOT NULL,
    category_id integer,
    cost_price integer,
    selling_price integer,
    unit character varying(255),
    description text,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.product OWNER TO postgres;

--
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_id_seq OWNER TO postgres;

--
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_id_seq OWNED BY public.product.id;


--
-- Name: purchase_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_items (
    id integer NOT NULL,
    purchase_id integer,
    product_id integer,
    quantity integer,
    unit_cost numeric(255,0),
    total_cost numeric(255,0)
);


ALTER TABLE public.purchase_items OWNER TO postgres;

--
-- Name: purchase_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_items_id_seq OWNER TO postgres;

--
-- Name: purchase_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_items_id_seq OWNED BY public.purchase_items.id;


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchases (
    id integer NOT NULL,
    "total amount" integer,
    "purchase datee" timestamp(6) with time zone,
    created_at timestamp(6) with time zone,
    supplier_id integer,
    user_id integer
);


ALTER TABLE public.purchases OWNER TO postgres;

--
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchases_id_seq OWNER TO postgres;

--
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(255),
    description character varying(255),
    created_at timestamp(6) with time zone
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_items (
    id integer NOT NULL,
    sale_id integer,
    product_id integer,
    quantity integer,
    unit_price numeric(255,0),
    total_price numeric(255,0)
);


ALTER TABLE public.sale_items OWNER TO postgres;

--
-- Name: sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_items_id_seq OWNER TO postgres;

--
-- Name: sale_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_items_id_seq OWNED BY public.sale_items.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    user_id integer,
    total_amount numeric(255,0),
    sale_date timestamp(6) with time zone,
    created_at timestamp(6) with time zone
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_id_seq OWNER TO postgres;

--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name character varying(255),
    phone character varying(255),
    email character varying(255),
    address character varying(255),
    created_at character varying
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suppliers_id_seq OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255),
    email character varying(255) NOT NULL,
    password character varying(255),
    role_id integer,
    created_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: ledger id; Type: DEFAULT; Schema: prisma_contract; Owner: postgres
--

ALTER TABLE ONLY prisma_contract.ledger ALTER COLUMN id SET DEFAULT nextval('prisma_contract.ledger_id_seq'::regclass);


--
-- Name: Expense id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expense" ALTER COLUMN id SET DEFAULT nextval('public."Expense_id_seq"'::regclass);


--
-- Name: Inventory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory" ALTER COLUMN id SET DEFAULT nextval('public."Inventory_id_seq"'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: inventory_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements ALTER COLUMN id SET DEFAULT nextval('public.inventory_movements_id_seq'::regclass);


--
-- Name: product id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product ALTER COLUMN id SET DEFAULT nextval('public.product_id_seq'::regclass);


--
-- Name: purchase_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_items_id_seq'::regclass);


--
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: sale_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items ALTER COLUMN id SET DEFAULT nextval('public.sale_items_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: contract; Type: TABLE DATA; Schema: prisma_contract; Owner: postgres
--

COPY prisma_contract.contract (core_hash, created_at, contract_json) FROM stdin;
d5c862f4f85c03159cc96ef27542b9bf8cbaf8697bcf7b99d94e1927f773aea6	2026-09-25 17:21:50.452037+02	{"meta": {}, "roots": {"Product": {"model": "Product", "namespace": "public"}}, "domain": {"namespaces": {"public": {"models": {"Product": {"fields": {"id": {"type": {"kind": "scalar", "codecId": "pg/int4@1"}, "nullable": false}, "sku": {"type": {"kind": "scalar", "codecId": "pg/text@1"}, "nullable": false}, "name": {"type": {"kind": "scalar", "codecId": "pg/text@1"}, "nullable": false}, "quantity": {"type": {"kind": "scalar", "codecId": "pg/int4@1"}, "nullable": false}, "unitCost": {"type": {"kind": "scalar", "codecId": "pg/numeric@1"}, "nullable": false}, "createdAt": {"type": {"kind": "scalar", "codecId": "pg/timestamptz-temporal@1"}, "nullable": false}, "updatedAt": {"type": {"kind": "scalar", "codecId": "pg/timestamptz-temporal@1"}, "nullable": false}, "description": {"type": {"kind": "scalar", "codecId": "pg/text@1"}, "nullable": true}, "sellingPrice": {"type": {"kind": "scalar", "codecId": "pg/numeric@1"}, "nullable": false}}, "storage": {"table": "Product", "fields": {"id": {"column": "id"}, "sku": {"column": "sku"}, "name": {"column": "name"}, "quantity": {"column": "quantity"}, "unitCost": {"column": "unitCost"}, "createdAt": {"column": "createdAt"}, "updatedAt": {"column": "updatedAt"}, "description": {"column": "description"}, "sellingPrice": {"column": "sellingPrice"}}, "namespaceId": "public"}, "relations": {}}}}}}, "target": "postgres", "storage": {"namespaces": {"public": {"id": "public", "kind": "postgres-schema", "entries": {"table": {"Product": {"columns": {"id": {"codecId": "pg/int4@1", "default": {"kind": "function", "expression": "autoincrement()"}, "nullable": false, "nativeType": "int4"}, "sku": {"codecId": "pg/text@1", "nullable": false, "nativeType": "text"}, "name": {"codecId": "pg/text@1", "nullable": false, "nativeType": "text"}, "quantity": {"codecId": "pg/int4@1", "default": {"kind": "literal", "value": 0}, "nullable": false, "nativeType": "int4"}, "unitCost": {"codecId": "pg/numeric@1", "nullable": false, "nativeType": "numeric"}, "createdAt": {"codecId": "pg/timestamptz-temporal@1", "default": {"kind": "function", "expression": "now()"}, "nullable": false, "nativeType": "timestamptz"}, "updatedAt": {"codecId": "pg/timestamptz-temporal@1", "default": {"kind": "function", "expression": "now()"}, "nullable": false, "nativeType": "timestamptz"}, "description": {"codecId": "pg/text@1", "nullable": true, "nativeType": "text"}, "sellingPrice": {"codecId": "pg/numeric@1", "nullable": false, "nativeType": "numeric"}}, "indexes": [], "uniques": [{"columns": ["sku"]}], "primaryKey": {"columns": ["id"]}, "foreignKeys": []}}}}}, "storageHash": "d5c862f4f85c03159cc96ef27542b9bf8cbaf8697bcf7b99d94e1927f773aea6"}, "_generated": {"message": "This file is automatically generated by \\"prisma contract emit\\".", "warning": "⚠️  GENERATED FILE - DO NOT EDIT", "regenerate": "To regenerate, run: prisma contract emit"}, "extensions": {}, "profileHash": "3916f444a8a17ad749191acf9e08dad97d1a327b88c2f1d45d12f240296aa8b2", "capabilities": {"sql": {"enums": true, "lateral": true, "returning": true, "scalarList": true, "checkConstraint": true, "defaultInInsert": true, "insertOnConflictSkip": true, "insertOnConflictWithoutTarget": true}, "postgres": {"limit": true, "jsonAgg": true, "lateral": true, "orderBy": true, "returning": true, "distinctOn": true}}, "targetFamily": "sql", "schemaVersion": "1"}
\.


--
-- Data for Name: ledger; Type: TABLE DATA; Schema: prisma_contract; Owner: postgres
--

COPY prisma_contract.ledger (id, created_at, space, migration_name, migration_hash, origin_core_hash, origin_profile_hash, destination_core_hash, destination_profile_hash, operations) FROM stdin;
1	2026-09-25 17:21:50.452037+02	app	20260925T1519_initial_product	0c7639a6be638f97b88ff07b5f5e17254ef4f891b7275baadb875e1c1644c4ac	empty	\N	d5c862f4f85c03159cc96ef27542b9bf8cbaf8697bcf7b99d94e1927f773aea6	\N	[{"id": "schema.public", "label": "Create schema \\"public\\"", "target": {"id": "postgres"}, "execute": [{"sql": "CREATE SCHEMA IF NOT EXISTS \\"public\\"", "params": [], "description": "Create schema \\"public\\""}], "precheck": [], "postcheck": [], "operationClass": "additive"}, {"id": "table.Product", "label": "Create table \\"Product\\"", "target": {"id": "postgres", "details": {"name": "Product", "schema": "public", "objectType": "table"}}, "execute": [{"sql": "CREATE TABLE \\"public\\".\\"Product\\" (\\n  \\"createdAt\\" timestamptz DEFAULT (now()) NOT NULL,\\n  \\"description\\" text,\\n  \\"id\\" SERIAL NOT NULL,\\n  \\"name\\" text NOT NULL,\\n  \\"quantity\\" int4 DEFAULT 0 NOT NULL,\\n  \\"sellingPrice\\" numeric NOT NULL,\\n  \\"sku\\" text NOT NULL,\\n  \\"unitCost\\" numeric NOT NULL,\\n  \\"updatedAt\\" timestamptz DEFAULT (now()) NOT NULL,\\n  PRIMARY KEY (\\"id\\")\\n)", "params": [], "description": "create table \\"Product\\""}], "summary": "Creates table \\"Product\\"", "precheck": [{"sql": "SELECT (to_regclass($1)) IS NULL AS \\"result\\"", "params": ["\\"public\\".\\"Product\\""], "description": "ensure table \\"Product\\" does not exist"}], "postcheck": [{"sql": "SELECT (to_regclass($1)) IS NOT NULL AS \\"result\\"", "params": ["\\"public\\".\\"Product\\""], "description": "verify table \\"Product\\" exists"}], "operationClass": "additive"}, {"id": "unique.Product.Product_sku_key", "label": "Add unique constraint on \\"Product\\" (sku)", "target": {"id": "postgres", "details": {"name": "Product_sku_key", "table": "Product", "schema": "public", "objectType": "unique"}}, "execute": [{"sql": "ALTER TABLE \\"public\\".\\"Product\\" ADD CONSTRAINT \\"Product_sku_key\\" UNIQUE (\\"sku\\")", "description": "add unique constraint \\"Product_sku_key\\""}], "precheck": [{"sql": "SELECT NOT EXISTS (SELECT 1 AS \\"one\\" FROM \\"pg_constraint\\" AS \\"c\\" INNER JOIN \\"pg_namespace\\" AS \\"n\\" ON \\"n\\".\\"oid\\" = \\"c\\".\\"connamespace\\" WHERE (\\"c\\".\\"conname\\" = $1 AND \\"n\\".\\"nspname\\" = $2 AND \\"c\\".\\"conrelid\\" = to_regclass($3))) AS \\"result\\"", "params": ["Product_sku_key", "public", "\\"public\\".\\"Product\\""], "description": "ensure constraint \\"Product_sku_key\\" does not exist"}], "postcheck": [{"sql": "SELECT EXISTS (SELECT 1 AS \\"one\\" FROM \\"pg_constraint\\" AS \\"c\\" INNER JOIN \\"pg_namespace\\" AS \\"n\\" ON \\"n\\".\\"oid\\" = \\"c\\".\\"connamespace\\" WHERE (\\"c\\".\\"conname\\" = $1 AND \\"n\\".\\"nspname\\" = $2 AND \\"c\\".\\"conrelid\\" = to_regclass($3))) AS \\"result\\"", "params": ["Product_sku_key", "public", "\\"public\\".\\"Product\\""], "description": "verify constraint \\"Product_sku_key\\" exists"}], "operationClass": "additive"}]
\.


--
-- Data for Name: marker; Type: TABLE DATA; Schema: prisma_contract; Owner: postgres
--

COPY prisma_contract.marker (space, core_hash, profile_hash, contract_json, canonical_version, updated_at, app_tag, meta, invariants) FROM stdin;
app	d5c862f4f85c03159cc96ef27542b9bf8cbaf8697bcf7b99d94e1927f773aea6	3916f444a8a17ad749191acf9e08dad97d1a327b88c2f1d45d12f240296aa8b2	\N	\N	2026-09-25 17:21:50.452037+02	\N	{}	{}
\.


--
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Expense" (id, title, description, amount, "expenseDate", "createdAt", "updatedAt", category) FROM stdin;
2	water	Monthly water bill	35000	2026-10-01 11:48:39.709+02	2026-10-01 11:48:39.712+02	2026-10-01 11:48:39.712+02	OTHER
4	electricity	Monthly water bill	35000	2026-10-01 11:52:16.741+02	2026-10-01 11:52:16.742+02	2026-10-01 11:52:16.742+02	OTHER
5	Test Expense	\N	1000	2026-10-01 12:32:17.378+02	2026-10-01 12:32:17.378+02	2026-10-01 12:32:17.378+02	RENT
6	Electricity bill	Monthly electricity payment	25000	2026-10-01 12:32:42.056+02	2026-10-01 12:32:42.25+02	2026-10-01 12:32:42.25+02	RENT
7	Electricity bill	Monthly electricity payment	25000	2026-10-01 12:34:21.643+02	2026-10-01 12:34:21.652+02	2026-10-01 12:34:21.652+02	OTHER
8	Electricity bill	Monthly electricity payment	25000	2026-10-06 20:51:12.454+02	2026-10-06 20:51:12.475+02	2026-10-06 20:51:12.475+02	RENT
1	cloths	Monthly water bill	35000	2026-10-01 11:48:09.642+02	2026-10-01 11:48:09.923+02	2026-10-06 20:51:23.837+02	OTHER
\.


--
-- Data for Name: Inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Inventory" (id, "productId", quantity, "createdAt", "updatedAt") FROM stdin;
13	4	5	2026-10-01 09:38:22.493+02	2026-10-01 11:17:13.785+02
18	10	1	2026-10-01 09:57:20.932+02	2026-10-01 11:42:33.389+02
7	3	38	2026-10-01 07:28:57.402+02	2026-10-07 07:37:07.251+02
21	14	20	2026-10-07 19:44:00.922+02	2026-10-07 19:44:00.922+02
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ba57a747-f6ef-4aa9-a225-62401414519a	14d305f86a358038b91a2e4350afbab4a28293689b5377ff695ac78027abe33c	2026-09-29 11:44:30.338907+02	20260929094430_init	\N	\N	2026-09-29 11:44:30.162823+02	1
4306bc7d-ecd3-48c9-82ea-18b6e20ac709	6f2f431605c4d06f7e06133882545224e6f05e627a6957747046cdb3fdde9cf8	2026-09-29 20:44:52.101024+02	20260929184452_add_auto_increment_id	\N	\N	2026-09-29 20:44:52.068445+02	1
1de197fe-b7fe-443e-95e6-59897b025bc8	ec136495f633c1a9a19d4d0e70b04bd1b8becb1f6be1342a385285636beb7bb8	2026-09-30 12:36:59.952933+02	20260930103659_add_inventory_movements	\N	\N	2026-09-30 12:36:59.855993+02	1
1489bd7f-048c-4fbf-b118-5c28ca9e4132	bef6c9970ff1f5d2b230584d42feaf8e32db10dce0d415ac154b75f4fe4508c8	2026-10-01 14:03:45.776242+02	20261001120345_add_expense_category	\N	\N	2026-10-01 14:03:45.732755+02	1
2390fe3b-21a6-4f53-9141-ddd1e4f96a01	dd3156ada6d41670f670ab0cc090560dfab246054c8b4160b0db5cd53097ef60	2026-10-03 12:23:12.052603+02	20261003102312_add_product_is_active	\N	\N	2026-10-03 12:23:12.021776+02	1
f700b4ef-f53d-4931-afc4-f396dd11130f	37f2443713427d22f88abd39d415ac8730244e6fb2074ab2e2dadee07ea4a155	2026-10-03 12:38:38.174913+02	20261003103838_add_category_is_active	\N	\N	2026-10-03 12:38:38.153579+02	1
bbfd3408-8dc4-4f5d-a882-8e669be1258d	f757ad8a16a07fcc51b457a0a14821b4b76f4e1c2470df641de9976f1bd5012b	\N	20261005120600_add_unique_email_to_users	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20261005120600_add_unique_email_to_users\n\nDatabase error code: 42P07\n\nDatabase error:\nERROR: relation "fki_supplier_id" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P07), message: "relation \\"fki_supplier_id\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(4181), routine: Some("RenameRelationInternal") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20261005120600_add_unique_email_to_users"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20261005120600_add_unique_email_to_users"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:255	2026-10-05 14:08:45.655876+02	2026-10-05 14:06:00.46356+02	0
7af48756-a50f-41f7-838d-c8dde561249a	38c15bfd5ca42fe46a65afebaf9245cd2175f253e9f0df14423c0908d03e6487	2026-10-05 14:23:28.440313+02	20261005120600_add_unique_email_to_users	\N	\N	2026-10-05 14:23:28.423797+02	1
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, created_at, "isActive") FROM stdin;
10	material	all types of food	2026-10-01 09:21:06.055+02	f
12	material	all types of food	2026-10-03 10:51:36.209+02	f
9	clothes	all types of food	2026-10-01 09:20:53.776+02	f
8	food	all types of food	2026-10-01 09:20:24.285+02	f
13	clothes	all type of clothes	2026-10-03 12:10:33.637+02	t
14	shoes	all type of shoes	2026-10-03 12:11:11.387+02	t
15	bags	all type of bags	2026-10-03 12:11:49.852+02	t
16	shoes	all type of shoes	2026-10-06 08:52:02.557+02	t
17	shoes	all type of shoes	2026-10-06 09:07:14.861+02	t
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_movements (id, "productId", quantity, type, reference, "createdAt") FROM stdin;
1	3	12	IN	purchase-001	2026-10-01 07:28:57.425
2	3	12	OUT	purchase-001	2026-10-01 07:29:27.786
3	3	12	IN	purchase-001	2026-10-01 07:29:42.23
4	3	13	IN	purchase-002	2026-10-01 07:30:09.827
5	3	13	OUT	purchase-002	2026-10-01 07:41:27.008
6	3	5	IN	PURCHASE-1	2026-10-01 08:48:30.481
7	3	3	IN	PURCHASE-1	2026-10-01 08:48:30.535
8	3	5	IN	PURCHASE-3	2026-10-01 09:38:22.48
9	4	3	IN	PURCHASE-3	2026-10-01 09:38:22.497
10	3	5	IN	PURCHASE-4	2026-10-01 09:56:34.705
11	3	3	IN	PURCHASE-4	2026-10-01 09:56:34.728
12	3	5	IN	PURCHASE-5	2026-10-01 09:57:09.51
13	4	3	IN	PURCHASE-5	2026-10-01 09:57:09.522
14	10	5	IN	PURCHASE-6	2026-10-01 09:57:20.936
15	4	3	IN	PURCHASE-6	2026-10-01 09:57:20.949
16	4	2	OUT	SALE-1	2026-10-01 11:12:03.464
17	4	2	OUT	SALE-2	2026-10-01 11:17:13.79
18	10	2	OUT	SALE-3	2026-10-01 11:41:51.428
19	10	2	OUT	SALE-4	2026-10-01 11:42:33.392
20	3	13	OUT	purchase-002	2026-10-06 20:53:39.066
21	3	13	IN	purchase-002	2026-10-07 07:37:07.366
22	14	10	IN	PURCHASE-10	2026-10-07 19:44:00.934
23	14	10	IN	PURCHASE-13	2026-10-08 15:27:47.944
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product (id, name, sku, category_id, cost_price, selling_price, unit, description, "isActive") FROM stdin;
10	clothes	B001	10	5000	8000	pair	buys product	f
4	clothes	B-003	10	5000	8000	pair	buys product	f
3	Blue Shoes	BS-004	\N	5000	\N	\N	Blue cotton shirt	f
5	Blue 	003	\N	5000	8000	\N	Blue cotton shirt	f
15	red-dress	B003	13	5000	8000	pair	products sales	t
16	sandar	B004	13	15000	18000	pair	products sales	t
18	sandar	B005	14	15000	18000	pair	products sales	t
19	slay queen	B006	15	10000	12000	pair	products sales	t
24	Peter Shirt	PS-007	10	5000	8000	piece	Peter shirt	t
28	Peter Shirt	PS-003	12	5000	8000	piece	Peter shirt	f
31	Peter Shirt	Pd-007	10	4000	8000	piece	Pete shirt	t
14	Peter Shirt	Ps-007	10	3000	8000	piece	Pete shirt	t
29	Peter Shirt	PS-006	10	5000	8000	piece	Pete shirt	f
\.


--
-- Data for Name: purchase_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_items (id, purchase_id, product_id, quantity, unit_cost, total_cost) FROM stdin;
1	1	3	5	5000	25000
2	1	3	3	4000	12000
3	3	3	5	5000	25000
4	3	4	3	4000	12000
5	4	3	5	5000	25000
6	4	3	3	4000	12000
7	5	3	5	5000	25000
8	5	4	3	4000	12000
9	6	10	5	5000	25000
10	6	4	3	4000	12000
11	10	14	10	5000	50000
12	13	14	10	5000	50000
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchases (id, "total amount", "purchase datee", created_at, supplier_id, user_id) FROM stdin;
1	37000	2026-10-01 08:48:30.287+02	2026-10-01 08:48:30.287+02	\N	\N
3	37000	2026-10-01 09:38:22.403+02	2026-10-01 09:38:22.403+02	\N	\N
4	37000	2026-10-01 09:56:34.634+02	2026-10-01 09:56:34.634+02	\N	\N
5	37000	2026-10-01 09:57:09.483+02	2026-10-01 09:57:09.483+02	\N	\N
6	37000	2026-10-01 09:57:20.925+02	2026-10-01 09:57:20.925+02	\N	\N
10	50000	2026-10-07 19:44:00.821+02	2026-10-07 19:44:00.821+02	\N	\N
13	50000	2026-10-08 15:27:47.903+02	2026-10-08 15:27:47.903+02	\N	\N
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, created_at) FROM stdin;
2	ADMIN	Full access to the system	2026-10-05 15:19:42.100076+02
3	MANAGER	Manages business operations	2026-10-05 15:19:42.100076+02
4	STAFF	Handles daily staff operations	2026-10-05 15:19:42.100076+02
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (id, sale_id, product_id, quantity, unit_price, total_price) FROM stdin;
1	1	4	2	8000	16000
2	2	4	2	8000	16000
3	3	10	2	8000	16000
4	4	10	2	8000	16000
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, user_id, total_amount, sale_date, created_at) FROM stdin;
1	\N	16000	2026-10-01 11:12:03.347+02	2026-10-01 11:12:03.347+02
2	\N	16000	2026-10-01 11:17:13.747+02	2026-10-01 11:17:13.747+02
3	\N	16000	2026-10-01 11:41:51.271+02	2026-10-01 11:41:51.271+02
4	\N	16000	2026-10-01 11:42:33.381+02	2026-10-01 11:42:33.381+02
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, phone, email, address, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role_id, created_at, updated_at) FROM stdin;
2	del	del@example.com	$2b$10$cn57eOGEFJZZb.rVc86j0OsFfuepG0vnuwKmFDjlhLjZAy/nhvm4m	\N	2026-10-05 13:43:39.415+02	2026-10-05 13:43:39.415+02
3	john	john@example.com	$2b$10$CVWg3zgrPEm9iSuUFEB29umG37cr51AmRvLaE1FpFbyx5nqKqDFLS	4	2026-10-05 13:50:40.624+02	2026-10-05 13:50:40.624+02
4	peter	peter@example.com	$2b$10$Algw4/YMq6Tu0uR0vwrEK.fsN1OYTAndpXeWG01ddGHcpSC5L11XK	3	2026-10-05 16:51:10.084+02	2026-10-05 16:51:10.084+02
1	Viviane	viviane@example.com	$2b$10$x9AnZ9HFeFwIxl.2WU9rae7ZnaO5ZI5iWyCnRPvX4ZQs/5Gt.fMFC	2	2026-10-05 12:36:59.068+02	2026-10-05 12:36:59.068+02
\.


--
-- Name: ledger_id_seq; Type: SEQUENCE SET; Schema: prisma_contract; Owner: postgres
--

SELECT pg_catalog.setval('prisma_contract.ledger_id_seq', 1, true);


--
-- Name: Expense_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Expense_id_seq"', 8, true);


--
-- Name: Inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Inventory_id_seq"', 22, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 17, true);


--
-- Name: inventory_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_movements_id_seq', 23, true);


--
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_id_seq', 31, true);


--
-- Name: purchase_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_items_id_seq', 12, true);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchases_id_seq', 13, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- Name: sale_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_items_id_seq', 4, true);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_id_seq', 4, true);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: contract contract_pkey; Type: CONSTRAINT; Schema: prisma_contract; Owner: postgres
--

ALTER TABLE ONLY prisma_contract.contract
    ADD CONSTRAINT contract_pkey PRIMARY KEY (core_hash);


--
-- Name: ledger ledger_pkey; Type: CONSTRAINT; Schema: prisma_contract; Owner: postgres
--

ALTER TABLE ONLY prisma_contract.ledger
    ADD CONSTRAINT ledger_pkey PRIMARY KEY (id);


--
-- Name: marker marker_pkey; Type: CONSTRAINT; Schema: prisma_contract; Owner: postgres
--

ALTER TABLE ONLY prisma_contract.marker
    ADD CONSTRAINT marker_pkey PRIMARY KEY (space);


--
-- Name: Expense Expense_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Expense"
    ADD CONSTRAINT "Expense_pkey" PRIMARY KEY (id);


--
-- Name: Inventory Inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: purchase_items purchase_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: Inventory_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Inventory_productId_key" ON public."Inventory" USING btree ("productId");


--
-- Name: fki_purchase_item_purchase_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_purchase_item_purchase_id_fkey ON public.purchase_items USING btree (purchase_id);


--
-- Name: fki_purchase_items_product_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_purchase_items_product_id_fkey ON public.purchase_items USING btree (product_id);


--
-- Name: fki_purchase_supplier_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_purchase_supplier_id_fkey ON public.purchases USING btree (supplier_id);


--
-- Name: fki_purchase_user_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_purchase_user_id_fkey ON public.purchases USING btree (user_id);


--
-- Name: fki_sale_items_product_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_sale_items_product_id_fkey ON public.sale_items USING btree (product_id);


--
-- Name: fki_sale_items_sale_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_sale_items_sale_id_fkey ON public.sale_items USING btree (sale_id);


--
-- Name: fki_supplier_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_supplier_id ON public.purchases USING btree (id);


--
-- Name: fki_u; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_u ON public.sales USING btree (user_id);


--
-- Name: inventory_movements_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "inventory_movements_productId_idx" ON public.inventory_movements USING btree ("productId");


--
-- Name: inventory_movements_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_movements_type_idx ON public.inventory_movements USING btree (type);


--
-- Name: sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sku ON public.product USING btree (sku);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: Inventory Inventory_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_movements inventory_movements_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT "inventory_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product product_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: purchase_items purchase_item_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_item_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id);


--
-- Name: purchase_items purchase_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id);


--
-- Name: purchases purchase_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchase_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE RESTRICT;


--
-- Name: purchases purchase_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchase_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: sale_items sale_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id);


--
-- Name: sale_items sale_items_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: sales sales_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users user_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict ifine1Wa3dXd9gRsP2BNsRRfOgdHp8q5cxLQ7SH2BnqC3OjqltFS2npJXOsp33l

