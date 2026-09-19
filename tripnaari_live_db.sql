--
-- PostgreSQL database dump
--

\restrict FpKAYEm2KvLT3J4ccXvf1y1uPVx76FOPhv5PO24MNfbxPgJxnn6FeD1alJcI0rN

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

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
-- Name: add_ons; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.add_ons (
    id integer NOT NULL,
    trip_package_id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    price integer NOT NULL,
    is_optional boolean DEFAULT true
);


ALTER TABLE public.add_ons OWNER TO tripnaari_user;

--
-- Name: add_ons_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.add_ons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.add_ons_id_seq OWNER TO tripnaari_user;

--
-- Name: add_ons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.add_ons_id_seq OWNED BY public.add_ons.id;


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.blog_posts (
    id integer NOT NULL,
    slug character varying(150) NOT NULL,
    title character varying(255) NOT NULL,
    excerpt character varying(500),
    content text NOT NULL,
    hero_image text,
    author character varying(100) DEFAULT 'TripNaari Team'::character varying,
    category character varying(100),
    tags json DEFAULT '[]'::json,
    is_published boolean DEFAULT true,
    seo_title character varying(255),
    seo_description text,
    published_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.blog_posts OWNER TO tripnaari_user;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_posts_id_seq OWNER TO tripnaari_user;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- Name: booking_requests; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.booking_requests (
    id integer NOT NULL,
    lead_id integer,
    trip_package_id integer,
    departure_id integer,
    travelers integer NOT NULL,
    total_amount integer,
    status character varying(50) DEFAULT 'pending'::character varying,
    special_requests text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.booking_requests OWNER TO tripnaari_user;

--
-- Name: booking_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.booking_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_requests_id_seq OWNER TO tripnaari_user;

--
-- Name: booking_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.booking_requests_id_seq OWNED BY public.booking_requests.id;


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.contact_messages (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    category character varying(50) NOT NULL,
    priority character varying(20) DEFAULT 'normal'::character varying,
    subject character varying(255),
    message text NOT NULL,
    status character varying(50) DEFAULT 'new'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contact_messages OWNER TO tripnaari_user;

--
-- Name: contact_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.contact_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_messages_id_seq OWNER TO tripnaari_user;

--
-- Name: contact_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.contact_messages_id_seq OWNED BY public.contact_messages.id;


--
-- Name: day_itineraries; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.day_itineraries (
    id integer NOT NULL,
    trip_package_id integer NOT NULL,
    day_number integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    location character varying(150),
    meals_included json DEFAULT '[]'::json,
    activities json DEFAULT '[]'::json,
    accommodation character varying(255),
    travel_notes text,
    image text
);


ALTER TABLE public.day_itineraries OWNER TO tripnaari_user;

--
-- Name: day_itineraries_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.day_itineraries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.day_itineraries_id_seq OWNER TO tripnaari_user;

--
-- Name: day_itineraries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.day_itineraries_id_seq OWNED BY public.day_itineraries.id;


--
-- Name: departure_dates; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.departure_dates (
    id integer NOT NULL,
    trip_package_id integer NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    seats_total integer DEFAULT 16,
    seats_booked integer DEFAULT 0,
    price integer,
    status character varying(30) DEFAULT 'open'::character varying,
    is_guaranteed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.departure_dates OWNER TO tripnaari_user;

--
-- Name: departure_dates_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.departure_dates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departure_dates_id_seq OWNER TO tripnaari_user;

--
-- Name: departure_dates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.departure_dates_id_seq OWNED BY public.departure_dates.id;


--
-- Name: exclusions; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.exclusions (
    id integer NOT NULL,
    trip_package_id integer NOT NULL,
    text character varying(255) NOT NULL
);


ALTER TABLE public.exclusions OWNER TO tripnaari_user;

--
-- Name: exclusions_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.exclusions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exclusions_id_seq OWNER TO tripnaari_user;

--
-- Name: exclusions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.exclusions_id_seq OWNED BY public.exclusions.id;


--
-- Name: faqs; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.faqs (
    id integer NOT NULL,
    question character varying(500) NOT NULL,
    answer text NOT NULL,
    category character varying(100),
    trip_package_id integer,
    "order" integer DEFAULT 0,
    is_published boolean DEFAULT true
);


ALTER TABLE public.faqs OWNER TO tripnaari_user;

--
-- Name: faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faqs_id_seq OWNER TO tripnaari_user;

--
-- Name: faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.faqs_id_seq OWNED BY public.faqs.id;


--
-- Name: gallery_assets; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.gallery_assets (
    id integer NOT NULL,
    url text NOT NULL,
    alt character varying(255),
    caption character varying(255),
    trip_package_id integer,
    tags json DEFAULT '[]'::json,
    uploaded_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.gallery_assets OWNER TO tripnaari_user;

--
-- Name: gallery_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.gallery_assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gallery_assets_id_seq OWNER TO tripnaari_user;

--
-- Name: gallery_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.gallery_assets_id_seq OWNED BY public.gallery_assets.id;


--
-- Name: hotel_previews; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.hotel_previews (
    id integer NOT NULL,
    trip_package_id integer NOT NULL,
    name character varying(150) NOT NULL,
    category character varying(50),
    location character varying(150),
    image text,
    amenities json DEFAULT '[]'::json,
    confirmation_timeline character varying(255) DEFAULT 'Hotel name shared 7 days before departure'::character varying,
    is_tbc boolean DEFAULT false
);


ALTER TABLE public.hotel_previews OWNER TO tripnaari_user;

--
-- Name: hotel_previews_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.hotel_previews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hotel_previews_id_seq OWNER TO tripnaari_user;

--
-- Name: hotel_previews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.hotel_previews_id_seq OWNED BY public.hotel_previews.id;


--
-- Name: inclusions; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.inclusions (
    id integer NOT NULL,
    trip_package_id integer NOT NULL,
    text character varying(255) NOT NULL,
    category character varying(100),
    icon character varying(50)
);


ALTER TABLE public.inclusions OWNER TO tripnaari_user;

--
-- Name: inclusions_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.inclusions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inclusions_id_seq OWNER TO tripnaari_user;

--
-- Name: inclusions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.inclusions_id_seq OWNED BY public.inclusions.id;


--
-- Name: leads; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    destination character varying(150),
    travel_month character varying(50),
    travelers integer DEFAULT 1,
    travel_style character varying(100),
    budget character varying(50),
    message text,
    consent boolean DEFAULT true,
    source character varying(100) DEFAULT 'website'::character varying,
    status character varying(50) DEFAULT 'new'::character varying,
    notes text,
    follow_up_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.leads OWNER TO tripnaari_user;

--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leads_id_seq OWNER TO tripnaari_user;

--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.newsletter_subscribers (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(150),
    source character varying(50) DEFAULT 'footer'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.newsletter_subscribers OWNER TO tripnaari_user;

--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.newsletter_subscribers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.newsletter_subscribers_id_seq OWNER TO tripnaari_user;

--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.newsletter_subscribers_id_seq OWNED BY public.newsletter_subscribers.id;


--
-- Name: policy_pages; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.policy_pages (
    id integer NOT NULL,
    slug character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    version integer DEFAULT 1,
    last_updated timestamp without time zone DEFAULT now(),
    is_published boolean DEFAULT true
);


ALTER TABLE public.policy_pages OWNER TO tripnaari_user;

--
-- Name: policy_pages_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.policy_pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.policy_pages_id_seq OWNER TO tripnaari_user;

--
-- Name: policy_pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.policy_pages_id_seq OWNED BY public.policy_pages.id;


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.push_subscriptions (
    id integer NOT NULL,
    endpoint text NOT NULL,
    p256dh character varying(255) NOT NULL,
    auth character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.push_subscriptions OWNER TO tripnaari_user;

--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.push_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.push_subscriptions_id_seq OWNER TO tripnaari_user;

--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.push_subscriptions_id_seq OWNED BY public.push_subscriptions.id;


--
-- Name: refund_requests; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.refund_requests (
    id integer NOT NULL,
    booking_request_id integer,
    lead_id integer,
    reason text NOT NULL,
    amount_requested integer,
    policy_acknowledged boolean DEFAULT false,
    status character varying(50) DEFAULT 'pending'::character varying,
    admin_notes text,
    created_at timestamp without time zone DEFAULT now(),
    resolved_at timestamp without time zone
);


ALTER TABLE public.refund_requests OWNER TO tripnaari_user;

--
-- Name: refund_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.refund_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refund_requests_id_seq OWNER TO tripnaari_user;

--
-- Name: refund_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.refund_requests_id_seq OWNED BY public.refund_requests.id;


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value json,
    description text,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.site_settings OWNER TO tripnaari_user;

--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.site_settings_id_seq OWNER TO tripnaari_user;

--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.testimonials (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    location character varying(100),
    trip_slug character varying(150),
    rating integer DEFAULT 5,
    content text NOT NULL,
    image text,
    is_featured boolean DEFAULT false,
    is_approved boolean DEFAULT true,
    travel_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.testimonials OWNER TO tripnaari_user;

--
-- Name: testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.testimonials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.testimonials_id_seq OWNER TO tripnaari_user;

--
-- Name: testimonials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.testimonials_id_seq OWNED BY public.testimonials.id;


--
-- Name: trip_leaders; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.trip_leaders (
    id integer NOT NULL,
    slug character varying(100) NOT NULL,
    name character varying(150) NOT NULL,
    bio text,
    specialties json DEFAULT '[]'::json,
    languages json DEFAULT '[]'::json,
    experience_years integer DEFAULT 3,
    trips_led integer DEFAULT 50,
    image text,
    instagram character varying(100),
    is_verified boolean DEFAULT true,
    safety_training boolean DEFAULT true,
    is_published boolean DEFAULT true
);


ALTER TABLE public.trip_leaders OWNER TO tripnaari_user;

--
-- Name: trip_leaders_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.trip_leaders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_leaders_id_seq OWNER TO tripnaari_user;

--
-- Name: trip_leaders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.trip_leaders_id_seq OWNED BY public.trip_leaders.id;


--
-- Name: trip_packages; Type: TABLE; Schema: public; Owner: tripnaari_user
--

CREATE TABLE public.trip_packages (
    id integer NOT NULL,
    slug character varying(150) NOT NULL,
    destination_slug character varying(100),
    title character varying(255) NOT NULL,
    short_description character varying(500),
    long_description text,
    duration_days integer NOT NULL,
    duration_nights integer NOT NULL,
    price_from integer NOT NULL,
    price_original integer,
    group_size_min integer DEFAULT 8,
    group_size_max integer DEFAULT 16,
    difficulty character varying(50),
    comfort_level character varying(50),
    is_women_only boolean DEFAULT true,
    is_family_friendly boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    hero_image text,
    gallery json DEFAULT '[]'::json,
    highlights json DEFAULT '[]'::json,
    rating_avg numeric(3,2) DEFAULT 4.9,
    rating_count integer DEFAULT 127,
    seo_title character varying(255),
    seo_description text,
    itinerary_change_policy text,
    itinerary_pdf text,
    is_published boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.trip_packages OWNER TO tripnaari_user;

--
-- Name: trip_packages_id_seq; Type: SEQUENCE; Schema: public; Owner: tripnaari_user
--

CREATE SEQUENCE public.trip_packages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_packages_id_seq OWNER TO tripnaari_user;

--
-- Name: trip_packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tripnaari_user
--

ALTER SEQUENCE public.trip_packages_id_seq OWNED BY public.trip_packages.id;


--
-- Name: add_ons id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.add_ons ALTER COLUMN id SET DEFAULT nextval('public.add_ons_id_seq'::regclass);


--
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- Name: booking_requests id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.booking_requests ALTER COLUMN id SET DEFAULT nextval('public.booking_requests_id_seq'::regclass);


--
-- Name: contact_messages id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.contact_messages ALTER COLUMN id SET DEFAULT nextval('public.contact_messages_id_seq'::regclass);


--
-- Name: day_itineraries id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.day_itineraries ALTER COLUMN id SET DEFAULT nextval('public.day_itineraries_id_seq'::regclass);


--
-- Name: departure_dates id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.departure_dates ALTER COLUMN id SET DEFAULT nextval('public.departure_dates_id_seq'::regclass);


--
-- Name: exclusions id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.exclusions ALTER COLUMN id SET DEFAULT nextval('public.exclusions_id_seq'::regclass);


--
-- Name: faqs id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.faqs ALTER COLUMN id SET DEFAULT nextval('public.faqs_id_seq'::regclass);


--
-- Name: gallery_assets id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.gallery_assets ALTER COLUMN id SET DEFAULT nextval('public.gallery_assets_id_seq'::regclass);


--
-- Name: hotel_previews id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.hotel_previews ALTER COLUMN id SET DEFAULT nextval('public.hotel_previews_id_seq'::regclass);


--
-- Name: inclusions id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.inclusions ALTER COLUMN id SET DEFAULT nextval('public.inclusions_id_seq'::regclass);


--
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- Name: newsletter_subscribers id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.newsletter_subscribers ALTER COLUMN id SET DEFAULT nextval('public.newsletter_subscribers_id_seq'::regclass);


--
-- Name: policy_pages id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.policy_pages ALTER COLUMN id SET DEFAULT nextval('public.policy_pages_id_seq'::regclass);


--
-- Name: push_subscriptions id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.push_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.push_subscriptions_id_seq'::regclass);


--
-- Name: refund_requests id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.refund_requests ALTER COLUMN id SET DEFAULT nextval('public.refund_requests_id_seq'::regclass);


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Name: testimonials id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.testimonials ALTER COLUMN id SET DEFAULT nextval('public.testimonials_id_seq'::regclass);


--
-- Name: trip_leaders id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.trip_leaders ALTER COLUMN id SET DEFAULT nextval('public.trip_leaders_id_seq'::regclass);


--
-- Name: trip_packages id; Type: DEFAULT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.trip_packages ALTER COLUMN id SET DEFAULT nextval('public.trip_packages_id_seq'::regclass);


--
-- Data for Name: add_ons; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.add_ons (id, trip_package_id, name, description, price, is_optional) FROM stdin;
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.blog_posts (id, slug, title, excerpt, content, hero_image, author, category, tags, is_published, seo_title, seo_description, published_at, created_at) FROM stdin;
\.


--
-- Data for Name: booking_requests; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.booking_requests (id, lead_id, trip_package_id, departure_id, travelers, total_amount, status, special_requests, created_at) FROM stdin;
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.contact_messages (id, name, email, phone, category, priority, subject, message, status, created_at) FROM stdin;
\.


--
-- Data for Name: day_itineraries; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.day_itineraries (id, trip_package_id, day_number, title, description, location, meals_included, activities, accommodation, travel_notes, image) FROM stdin;
\.


--
-- Data for Name: departure_dates; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.departure_dates (id, trip_package_id, start_date, end_date, seats_total, seats_booked, price, status, is_guaranteed, created_at) FROM stdin;
\.


--
-- Data for Name: exclusions; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.exclusions (id, trip_package_id, text) FROM stdin;
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.faqs (id, question, answer, category, trip_package_id, "order", is_published) FROM stdin;
\.


--
-- Data for Name: gallery_assets; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.gallery_assets (id, url, alt, caption, trip_package_id, tags, uploaded_at) FROM stdin;
\.


--
-- Data for Name: hotel_previews; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.hotel_previews (id, trip_package_id, name, category, location, image, amenities, confirmation_timeline, is_tbc) FROM stdin;
\.


--
-- Data for Name: inclusions; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.inclusions (id, trip_package_id, text, category, icon) FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.leads (id, name, email, phone, destination, travel_month, travelers, travel_style, budget, message, consent, source, status, notes, follow_up_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.newsletter_subscribers (id, email, name, source, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: policy_pages; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.policy_pages (id, slug, title, content, version, last_updated, is_published) FROM stdin;
\.


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.push_subscriptions (id, endpoint, p256dh, auth, created_at) FROM stdin;
\.


--
-- Data for Name: refund_requests; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.refund_requests (id, booking_request_id, lead_id, reason, amount_requested, policy_acknowledged, status, admin_notes, created_at, resolved_at) FROM stdin;
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.site_settings (id, key, value, description, updated_at) FROM stdin;
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.testimonials (id, name, location, trip_slug, rating, content, image, is_featured, is_approved, travel_date, created_at) FROM stdin;
\.


--
-- Data for Name: trip_leaders; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.trip_leaders (id, slug, name, bio, specialties, languages, experience_years, trips_led, image, instagram, is_verified, safety_training, is_published) FROM stdin;
\.


--
-- Data for Name: trip_packages; Type: TABLE DATA; Schema: public; Owner: tripnaari_user
--

COPY public.trip_packages (id, slug, destination_slug, title, short_description, long_description, duration_days, duration_nights, price_from, price_original, group_size_min, group_size_max, difficulty, comfort_level, is_women_only, is_family_friendly, is_featured, hero_image, gallery, highlights, rating_avg, rating_count, seo_title, seo_description, itinerary_change_policy, itinerary_pdf, is_published, created_at, updated_at) FROM stdin;
\.


--
-- Name: add_ons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.add_ons_id_seq', 1, false);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.blog_posts_id_seq', 1, false);


--
-- Name: booking_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.booking_requests_id_seq', 1, false);


--
-- Name: contact_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.contact_messages_id_seq', 1, false);


--
-- Name: day_itineraries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.day_itineraries_id_seq', 1, false);


--
-- Name: departure_dates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.departure_dates_id_seq', 1, false);


--
-- Name: exclusions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.exclusions_id_seq', 1, false);


--
-- Name: faqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.faqs_id_seq', 1, false);


--
-- Name: gallery_assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.gallery_assets_id_seq', 1, false);


--
-- Name: hotel_previews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.hotel_previews_id_seq', 1, false);


--
-- Name: inclusions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.inclusions_id_seq', 1, false);


--
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.leads_id_seq', 1, false);


--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.newsletter_subscribers_id_seq', 1, false);


--
-- Name: policy_pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.policy_pages_id_seq', 1, false);


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.push_subscriptions_id_seq', 1, false);


--
-- Name: refund_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.refund_requests_id_seq', 1, false);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 1, false);


--
-- Name: testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.testimonials_id_seq', 1, false);


--
-- Name: trip_leaders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.trip_leaders_id_seq', 1, false);


--
-- Name: trip_packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tripnaari_user
--

SELECT pg_catalog.setval('public.trip_packages_id_seq', 1, false);


--
-- Name: add_ons add_ons_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.add_ons
    ADD CONSTRAINT add_ons_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_unique; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_unique UNIQUE (slug);


--
-- Name: booking_requests booking_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.booking_requests
    ADD CONSTRAINT booking_requests_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: day_itineraries day_itineraries_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.day_itineraries
    ADD CONSTRAINT day_itineraries_pkey PRIMARY KEY (id);


--
-- Name: departure_dates departure_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.departure_dates
    ADD CONSTRAINT departure_dates_pkey PRIMARY KEY (id);


--
-- Name: exclusions exclusions_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.exclusions
    ADD CONSTRAINT exclusions_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: gallery_assets gallery_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.gallery_assets
    ADD CONSTRAINT gallery_assets_pkey PRIMARY KEY (id);


--
-- Name: hotel_previews hotel_previews_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.hotel_previews
    ADD CONSTRAINT hotel_previews_pkey PRIMARY KEY (id);


--
-- Name: inclusions inclusions_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.inclusions
    ADD CONSTRAINT inclusions_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_email_unique; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: policy_pages policy_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.policy_pages
    ADD CONSTRAINT policy_pages_pkey PRIMARY KEY (id);


--
-- Name: policy_pages policy_pages_slug_unique; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.policy_pages
    ADD CONSTRAINT policy_pages_slug_unique UNIQUE (slug);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: refund_requests refund_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT refund_requests_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_key_unique UNIQUE (key);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: trip_leaders trip_leaders_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.trip_leaders
    ADD CONSTRAINT trip_leaders_pkey PRIMARY KEY (id);


--
-- Name: trip_leaders trip_leaders_slug_unique; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.trip_leaders
    ADD CONSTRAINT trip_leaders_slug_unique UNIQUE (slug);


--
-- Name: trip_packages trip_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.trip_packages
    ADD CONSTRAINT trip_packages_pkey PRIMARY KEY (id);


--
-- Name: trip_packages trip_packages_slug_unique; Type: CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.trip_packages
    ADD CONSTRAINT trip_packages_slug_unique UNIQUE (slug);


--
-- Name: add_ons add_ons_trip_package_id_trip_packages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.add_ons
    ADD CONSTRAINT add_ons_trip_package_id_trip_packages_id_fk FOREIGN KEY (trip_package_id) REFERENCES public.trip_packages(id);


--
-- Name: booking_requests booking_requests_departure_id_departure_dates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.booking_requests
    ADD CONSTRAINT booking_requests_departure_id_departure_dates_id_fk FOREIGN KEY (departure_id) REFERENCES public.departure_dates(id);


--
-- Name: booking_requests booking_requests_lead_id_leads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.booking_requests
    ADD CONSTRAINT booking_requests_lead_id_leads_id_fk FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- Name: booking_requests booking_requests_trip_package_id_trip_packages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.booking_requests
    ADD CONSTRAINT booking_requests_trip_package_id_trip_packages_id_fk FOREIGN KEY (trip_package_id) REFERENCES public.trip_packages(id);


--
-- Name: day_itineraries day_itineraries_trip_package_id_trip_packages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.day_itineraries
    ADD CONSTRAINT day_itineraries_trip_package_id_trip_packages_id_fk FOREIGN KEY (trip_package_id) REFERENCES public.trip_packages(id);


--
-- Name: departure_dates departure_dates_trip_package_id_trip_packages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.departure_dates
    ADD CONSTRAINT departure_dates_trip_package_id_trip_packages_id_fk FOREIGN KEY (trip_package_id) REFERENCES public.trip_packages(id);


--
-- Name: exclusions exclusions_trip_package_id_trip_packages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.exclusions
    ADD CONSTRAINT exclusions_trip_package_id_trip_packages_id_fk FOREIGN KEY (trip_package_id) REFERENCES public.trip_packages(id);


--
-- Name: faqs faqs_trip_package_id_trip_packages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_trip_package_id_trip_packages_id_fk FOREIGN KEY (trip_package_id) REFERENCES public.trip_packages(id);


--
-- Name: gallery_assets gallery_assets_trip_package_id_trip_packages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.gallery_assets
    ADD CONSTRAINT gallery_assets_trip_package_id_trip_packages_id_fk FOREIGN KEY (trip_package_id) REFERENCES public.trip_packages(id);


--
-- Name: hotel_previews hotel_previews_trip_package_id_trip_packages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.hotel_previews
    ADD CONSTRAINT hotel_previews_trip_package_id_trip_packages_id_fk FOREIGN KEY (trip_package_id) REFERENCES public.trip_packages(id);


--
-- Name: inclusions inclusions_trip_package_id_trip_packages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.inclusions
    ADD CONSTRAINT inclusions_trip_package_id_trip_packages_id_fk FOREIGN KEY (trip_package_id) REFERENCES public.trip_packages(id);


--
-- Name: refund_requests refund_requests_booking_request_id_booking_requests_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT refund_requests_booking_request_id_booking_requests_id_fk FOREIGN KEY (booking_request_id) REFERENCES public.booking_requests(id);


--
-- Name: refund_requests refund_requests_lead_id_leads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: tripnaari_user
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT refund_requests_lead_id_leads_id_fk FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- PostgreSQL database dump complete
--

\unrestrict FpKAYEm2KvLT3J4ccXvf1y1uPVx76FOPhv5PO24MNfbxPgJxnn6FeD1alJcI0rN

