-- Adminer 4.8.1 PostgreSQL 9.2.23 dump

DROP TABLE IF EXISTS "Agents";
DROP SEQUENCE IF EXISTS "Agents_id_seq";
CREATE SEQUENCE "Agents_id_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "public"."Agents" (
    "id" integer DEFAULT nextval('"Agents_id_seq"') NOT NULL,
    "agentId" character varying(255) NOT NULL,
    "apiKey" character varying(255) NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL,
    "deletedAt" timestamp,
    "currencyId" integer,
    CONSTRAINT "PK_b4e7fd12e37eab4d05f295012eb" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_14ccf9407f371e37f09f55eeba8" UNIQUE ("agentId")
) WITH (oids = false);


DROP TABLE IF EXISTS "Currencies";
DROP SEQUENCE IF EXISTS "Currencies_id_seq";
CREATE SEQUENCE "Currencies_id_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "public"."Currencies" (
    "id" integer DEFAULT nextval('"Currencies_id_seq"') NOT NULL,
    "code" character varying(255) NOT NULL,
    "name" character varying(255) NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL,
    "deletedAt" timestamp,
    CONSTRAINT "PK_161926657054051e70c1d10818f" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_548fc433eeea85dc7f034dc8629" UNIQUE ("code")
) WITH (oids = false);


DROP TABLE IF EXISTS "Transactions";
DROP SEQUENCE IF EXISTS "Transactions_id_seq";
CREATE SEQUENCE "Transactions_id_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "public"."Transactions" (
    "id" integer DEFAULT nextval('"Transactions_id_seq"') NOT NULL,
    "transId" bigint NOT NULL,
    "ticketBetId" character varying(255) NOT NULL,
    "sDate" timestamp NOT NULL,
    "bAmt" numeric(20,4) DEFAULT '0' NOT NULL,
    "wAmt" numeric(20,4) DEFAULT '0' NOT NULL,
    "payout" numeric(20,4) DEFAULT '0' NOT NULL,
    "creditDeducted" numeric(20,4) DEFAULT '0' NOT NULL,
    "winloss" "Transactions_winloss_enum" NOT NULL,
    "status" "Transactions_status_enum" NOT NULL,
    "ip" character varying(255) NOT NULL,
    "odds" character varying(255) NOT NULL,
    "commPerc" numeric(20,4) DEFAULT '0' NOT NULL,
    "comm" numeric(20,4) DEFAULT '0' NOT NULL,
    "game" character varying(255) NOT NULL,
    "source" "Transactions_source_enum" NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL,
    "deletedAt" timestamp,
    "userId" integer,
    CONSTRAINT "PK_7761bf9766670b894ff2fdb3700" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "Users";
DROP SEQUENCE IF EXISTS "Users_id_seq";
CREATE SEQUENCE "Users_id_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "public"."Users" (
    "id" integer DEFAULT nextval('"Users_id_seq"') NOT NULL,
    "userId" character varying(255) NOT NULL,
    "hash" character varying(255) NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL,
    "deletedAt" timestamp,
    "agentId" integer,
    CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_a06d29e81a4b836dddfd684ab87" UNIQUE ("userId")
) WITH (oids = false);


DROP TABLE IF EXISTS "Wallets";
DROP SEQUENCE IF EXISTS "Wallets_id_seq";
CREATE SEQUENCE "Wallets_id_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1;

CREATE TABLE "public"."Wallets" (
    "id" integer DEFAULT nextval('"Wallets_id_seq"') NOT NULL,
    "name" character varying(255) NOT NULL,
    "balance" numeric(20,4) DEFAULT '0' NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL,
    "deletedAt" timestamp,
    "userId" integer,
    CONSTRAINT "PK_22643866c3dcd5442c341d43b67" PRIMARY KEY ("id"),
    CONSTRAINT "REL_6c3a698210de6423e99a3cbe78" UNIQUE ("userId")
) WITH (oids = false);


ALTER TABLE ONLY "public"."Agents" ADD CONSTRAINT "FK_fa489196023f806b2248703aefc" FOREIGN KEY ("currencyId") REFERENCES "Currencies"(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."Transactions" ADD CONSTRAINT "FK_f01450fedf7507118ad25dcf41e" FOREIGN KEY ("userId") REFERENCES "Users"(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."Users" ADD CONSTRAINT "FK_1f0c8aa02123e33442e3825739a" FOREIGN KEY ("agentId") REFERENCES "Agents"(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."Wallets" ADD CONSTRAINT "FK_6c3a698210de6423e99a3cbe782" FOREIGN KEY ("userId") REFERENCES "Users"(id) NOT DEFERRABLE;

-- 2022-07-17 17:25:38.018595+00
