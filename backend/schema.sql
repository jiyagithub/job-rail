--
-- PostgreSQL database dump
--

\restrict p60CcERFub3OTy3r5ADqNHjpAe6FJxj3RoSnlc4TJlQ36foPEShwmasorKWowT3

-- Dumped from database version 16.14 (Homebrew)
-- Dumped by pg_dump version 16.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: dead_letter_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dead_letter_jobs (
    id integer NOT NULL,
    original_job_id integer,
    queue_id integer,
    job_name character varying(200),
    payload jsonb,
    priority integer,
    retry_count integer,
    error_message text,
    moved_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: dead_letter_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dead_letter_jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dead_letter_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dead_letter_jobs_id_seq OWNED BY public.dead_letter_jobs.id;


--
-- Name: job_executions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_executions (
    id integer NOT NULL,
    job_id integer NOT NULL,
    attempt_number integer NOT NULL,
    status character varying(20) NOT NULL,
    error_message text,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    finished_at timestamp without time zone
);


--
-- Name: job_executions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_executions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_executions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_executions_id_seq OWNED BY public.job_executions.id;


--
-- Name: job_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_logs (
    id integer NOT NULL,
    job_id integer NOT NULL,
    log_level character varying(20) DEFAULT 'INFO'::character varying,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: job_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_logs_id_seq OWNED BY public.job_logs.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    queue_id integer NOT NULL,
    job_name character varying(200) NOT NULL,
    payload jsonb,
    status character varying(20) DEFAULT 'pending'::character varying,
    priority integer DEFAULT 0,
    retry_count integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    scheduled_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    owner_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: queues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.queues (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    project_id integer NOT NULL,
    priority integer DEFAULT 0,
    concurrency_limit integer DEFAULT 5,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: queues_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.queues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: queues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.queues_id_seq OWNED BY public.queues.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: workers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workers (
    id integer NOT NULL,
    worker_name character varying(100) NOT NULL,
    status character varying(20) DEFAULT 'online'::character varying,
    last_heartbeat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: workers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workers_id_seq OWNED BY public.workers.id;


--
-- Name: dead_letter_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dead_letter_jobs ALTER COLUMN id SET DEFAULT nextval('public.dead_letter_jobs_id_seq'::regclass);


--
-- Name: job_executions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_executions ALTER COLUMN id SET DEFAULT nextval('public.job_executions_id_seq'::regclass);


--
-- Name: job_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_logs ALTER COLUMN id SET DEFAULT nextval('public.job_logs_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: queues id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queues ALTER COLUMN id SET DEFAULT nextval('public.queues_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: workers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers ALTER COLUMN id SET DEFAULT nextval('public.workers_id_seq'::regclass);


--
-- Name: dead_letter_jobs dead_letter_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dead_letter_jobs
    ADD CONSTRAINT dead_letter_jobs_pkey PRIMARY KEY (id);


--
-- Name: job_executions job_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_executions
    ADD CONSTRAINT job_executions_pkey PRIMARY KEY (id);


--
-- Name: job_logs job_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_logs
    ADD CONSTRAINT job_logs_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: queues queues_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queues
    ADD CONSTRAINT queues_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workers workers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_pkey PRIMARY KEY (id);


--
-- Name: workers workers_worker_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_worker_name_key UNIQUE (worker_name);


--
-- Name: job_executions job_executions_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_executions
    ADD CONSTRAINT job_executions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: job_logs job_logs_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_logs
    ADD CONSTRAINT job_logs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_queue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_queue_id_fkey FOREIGN KEY (queue_id) REFERENCES public.queues(id) ON DELETE CASCADE;


--
-- Name: organizations organizations_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: queues queues_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.queues
    ADD CONSTRAINT queues_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict p60CcERFub3OTy3r5ADqNHjpAe6FJxj3RoSnlc4TJlQ36foPEShwmasorKWowT3

