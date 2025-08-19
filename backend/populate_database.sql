-- Sample data for Session Booking System
-- This populates the database with realistic conference sessions

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM bookings;
-- DELETE FROM sessions;

-- Digital Marketing Sessions
INSERT INTO sessions (title, description, category, subcategory, tags, duration, date, time, instructor, capacity, enrolled, location) VALUES
('Advanced SEO Strategies 2025', 'Master cutting-edge SEO techniques including Core Web Vitals, E-A-T, and AI-driven content optimization', 'DigitalMarketing', 'SEO', ARRAY['seo', 'advanced', 'technical seo', 'ai', 'core web vitals'], '3 hours', '2025-01-15', '9:00 AM', 'Sarah Johnson', 15, 3, 'Digital Marketing Lab'),
('Google Analytics 4 Deep Dive', 'Comprehensive GA4 setup, custom events, and advanced reporting techniques', 'DigitalMarketing', 'Analytics', ARRAY['analytics', 'ga4', 'tracking', 'intermediate', 'reporting'], '4 hours', '2025-01-15', '1:00 PM', 'David Kim', 20, 7, 'Analytics Suite'),
('International SEO & Multilingual Strategies', 'Optimize for global markets with hreflang, geo-targeting, and cultural SEO', 'DigitalMarketing', 'SEO', ARRAY['seo', 'international', 'advanced', 'hreflang', 'multilingual'], '2.5 hours', '2025-01-15', '3:00 PM', 'Carlos Mendez', 12, 4, 'Online Session'),
('SEO Content Writing Workshop', 'Write SEO-optimized content that ranks and converts', 'DigitalMarketing', 'SEO', ARRAY['seo', 'content writing', 'intermediate', 'copywriting', 'keywords'], '3 hours', '2025-01-15', '6:00 PM', 'Jessica Park', 25, 12, 'Creative Studio'),

-- PPC & Paid Advertising
('Google Ads Mastery: Search Campaigns', 'Create high-performing Google Search campaigns that drive conversions', 'DigitalMarketing', 'PPC', ARRAY['ppc', 'google ads', 'search', 'intermediate', 'conversion'], '3 hours', '2025-01-15', '11:00 AM', 'Mike Chen', 18, 5, 'Marketing Suite'),
('Facebook Ads for E-commerce', 'Scale your online store with advanced Facebook and Instagram advertising', 'DigitalMarketing', 'PPC', ARRAY['facebook ads', 'ecommerce', 'social media', 'advanced', 'scaling'], '4 hours', '2025-01-16', '10:00 AM', 'Amanda Rodriguez', 20, 8, 'E-commerce Hub'),
('YouTube Advertising Bootcamp', 'Master video advertising on YouTube for maximum reach and engagement', 'DigitalMarketing', 'PPC', ARRAY['youtube ads', 'video marketing', 'beginner', 'advertising', 'engagement'], '2.5 hours', '2025-01-16', '2:00 PM', 'Ryan Foster', 15, 6, 'Video Studio'),
('PPC Analytics & Optimization', 'Analyze campaign performance and optimize for maximum ROI', 'DigitalMarketing', 'PPC', ARRAY['ppc', 'analytics', 'optimization', 'advanced', 'roi'], '3.5 hours', '2025-01-17', '1:00 PM', 'Kevin Liu', 12, 3, 'Analytics Suite'),

-- Social Media Marketing
('Instagram Marketing for Business', 'Build a powerful Instagram presence that drives sales and engagement', 'SocialMedia', 'Instagram', ARRAY['instagram', 'social media', 'business', 'intermediate', 'engagement'], '3 hours', '2025-01-16', '9:00 AM', 'Lisa Thompson', 22, 11, 'Social Media Lab'),
('TikTok Marketing Strategy', 'Leverage TikTok for brand awareness and viral content creation', 'SocialMedia', 'TikTok', ARRAY['tiktok', 'viral marketing', 'content creation', 'beginner', 'trends'], '2 hours', '2025-01-16', '4:00 PM', 'Jake Morrison', 30, 18, 'Creative Space'),
('LinkedIn B2B Marketing', 'Generate leads and build professional relationships on LinkedIn', 'SocialMedia', 'LinkedIn', ARRAY['linkedin', 'b2b', 'lead generation', 'professional', 'networking'], '3.5 hours', '2025-01-17', '10:00 AM', 'Rachel Green', 16, 7, 'Business Center'),
('Social Media Analytics & ROI', 'Measure and optimize your social media marketing performance', 'SocialMedia', 'Analytics', ARRAY['social media', 'analytics', 'roi', 'measurement', 'optimization'], '2.5 hours', '2025-01-17', '3:00 PM', 'Tom Wilson', 18, 9, 'Analytics Suite'),

-- Content Marketing
('Content Strategy for SaaS Companies', 'Build a content engine that drives organic growth for software businesses', 'ContentMarketing', 'Strategy', ARRAY['content strategy', 'saas', 'organic growth', 'advanced', 'b2b'], '4 hours', '2025-01-18', '9:00 AM', 'Maria Gonzalez', 15, 4, 'Strategy Room'),
('Video Content Creation Workshop', 'Produce engaging video content for marketing campaigns', 'ContentMarketing', 'Video', ARRAY['video content', 'production', 'marketing', 'intermediate', 'storytelling'], '3.5 hours', '2025-01-18', '2:00 PM', 'Chris Evans', 12, 6, 'Video Production Studio'),
('Blog Writing & SEO Integration', 'Create blog content that ranks well and converts readers', 'ContentMarketing', 'Blogging', ARRAY['blogging', 'seo', 'content writing', 'intermediate', 'conversion'], '3 hours', '2025-01-19', '10:00 AM', 'Emma Davis', 20, 8, 'Writing Lab'),
('Podcast Marketing Strategy', 'Launch and grow a successful business podcast', 'ContentMarketing', 'Podcast', ARRAY['podcast', 'audio marketing', 'strategy', 'beginner', 'growth'], '2.5 hours', '2025-01-19', '2:30 PM', 'Alex Turner', 14, 5, 'Audio Studio'),

-- Web Development Sessions
('React.js Advanced Patterns', 'Master advanced React patterns including hooks, context, and performance optimization', 'WebDevelopment', 'Frontend', ARRAY['react', 'javascript', 'frontend', 'advanced', 'hooks'], '5 hours', '2025-01-15', '9:00 AM', 'John Smith', 16, 8, 'Dev Lab A'),
('Node.js & Express API Development', 'Build scalable REST APIs with Node.js, Express, and MongoDB', 'WebDevelopment', 'Backend', ARRAY['nodejs', 'express', 'api', 'backend', 'mongodb'], '4.5 hours', '2025-01-15', '2:00 PM', 'Sarah Wilson', 14, 6, 'Backend Lab'),
('Full-Stack TypeScript Development', 'End-to-end TypeScript development with modern frameworks', 'WebDevelopment', 'FullStack', ARRAY['typescript', 'fullstack', 'modern frameworks', 'intermediate', 'development'], '6 hours', '2025-01-16', '9:00 AM', 'Michael Brown', 12, 4, 'Full-Stack Studio'),
('GraphQL with Apollo Server', 'Build efficient APIs using GraphQL and Apollo Server', 'WebDevelopment', 'Backend', ARRAY['graphql', 'apollo', 'api', 'advanced', 'backend'], '4 hours', '2025-01-16', '1:00 PM', 'Jennifer Lee', 10, 3, 'API Lab'),
('Next.js Production Deployment', 'Deploy Next.js applications to production with best practices', 'WebDevelopment', 'Deployment', ARRAY['nextjs', 'deployment', 'production', 'vercel', 'intermediate'], '3 hours', '2025-01-17', '11:00 AM', 'David Park', 18, 9, 'Deployment Center'),
('Vue.js 3 Composition API', 'Modern Vue.js development with Composition API and TypeScript', 'WebDevelopment', 'Frontend', ARRAY['vue', 'composition api', 'typescript', 'frontend', 'modern'], '4 hours', '2025-01-17', '2:30 PM', 'Lisa Chang', 15, 7, 'Frontend Lab'),

-- Data Science & AI
('Machine Learning Fundamentals', 'Introduction to ML algorithms and model training', 'DataScience', 'MachineLearning', ARRAY['ml', 'algorithms', 'python', 'beginner', 'scikit-learn'], '4 hours', '2025-01-15', '9:00 AM', 'Dr. Emily Watson', 20, 8, 'ML Lab'),
('Deep Learning with TensorFlow', 'Build neural networks for computer vision and NLP', 'DataScience', 'DeepLearning', ARRAY['deep learning', 'tensorflow', 'neural networks', 'advanced', 'ai'], '5 hours', '2025-01-15', '1:30 PM', 'Dr. Alex Chen', 15, 4, 'AI Lab'),
('Data Analysis with Python & Pandas', 'Master data manipulation and analysis using Python', 'DataScience', 'Analytics', ARRAY['python', 'pandas', 'data analysis', 'intermediate', 'numpy'], '3.5 hours', '2025-01-16', '10:00 AM', 'Rachel Kim', 25, 12, 'Data Lab'),
('SQL for Data Science', 'Advanced SQL techniques for data analysis and reporting', 'DataScience', 'SQL', ARRAY['sql', 'data analysis', 'database', 'intermediate', 'queries'], '3 hours', '2025-01-16', '2:00 PM', 'Mark Johnson', 22, 10, 'Database Lab'),
('Data Visualization with D3.js', 'Create interactive data visualizations for the web', 'DataScience', 'Visualization', ARRAY['d3js', 'visualization', 'javascript', 'advanced', 'interactive'], '4 hours', '2025-01-17', '9:30 AM', 'Anna Rodriguez', 12, 5, 'Viz Studio'),

-- DevOps & Infrastructure
('Docker Containerization Workshop', 'Containerize applications with Docker and Docker Compose', 'DevOps', 'Docker', ARRAY['docker', 'containers', 'devops', 'intermediate', 'deployment'], '3.5 hours', '2025-01-15', '11:00 AM', 'Marcus Johnson', 16, 4, 'DevOps Lab'),
('Kubernetes Fundamentals', 'Orchestrate containers at scale with Kubernetes', 'DevOps', 'Kubernetes', ARRAY['kubernetes', 'orchestration', 'containers', 'advanced', 'scaling'], '5 hours', '2025-01-15', '1:00 PM', 'Anna Kowalski', 12, 2, 'K8s Lab'),
('CI/CD with GitHub Actions', 'Automate testing and deployment with GitHub Actions', 'DevOps', 'CICD', ARRAY['cicd', 'github actions', 'automation', 'deployment', 'testing'], '3 hours', '2025-01-16', '10:30 AM', 'Robert Chen', 18, 7, 'Automation Lab'),
('AWS Cloud Architecture', 'Design scalable applications on Amazon Web Services', 'DevOps', 'Cloud', ARRAY['aws', 'cloud', 'architecture', 'scalability', 'advanced'], '4.5 hours', '2025-01-16', '1:30 PM', 'Sandra Miller', 14, 6, 'Cloud Lab'),
('Infrastructure as Code with Terraform', 'Manage cloud infrastructure using Terraform', 'DevOps', 'IaC', ARRAY['terraform', 'infrastructure', 'iac', 'cloud', 'automation'], '4 hours', '2025-01-17', '9:00 AM', 'James Wilson', 10, 3, 'Infrastructure Lab'),

-- Product Management
('Product Strategy & Roadmapping', 'Build winning product strategies and roadmaps', 'ProductManagement', 'Strategy', ARRAY['product strategy', 'roadmapping', 'planning', 'intermediate', 'vision'], '4 hours', '2025-01-18', '9:00 AM', 'Jessica Taylor', 20, 9, 'Strategy Center'),
('User Research & Validation', 'Conduct effective user research to validate product ideas', 'ProductManagement', 'Research', ARRAY['user research', 'validation', 'interviews', 'beginner', 'insights'], '3 hours', '2025-01-18', '1:30 PM', 'Michael Davis', 16, 7, 'Research Lab'),
('Agile Product Management', 'Manage products effectively in agile environments', 'ProductManagement', 'Agile', ARRAY['agile', 'scrum', 'product management', 'intermediate', 'methodology'], '3.5 hours', '2025-01-19', '10:00 AM', 'Laura Anderson', 18, 8, 'Agile Room'),
('Product Analytics & Metrics', 'Measure product success with key metrics and analytics', 'ProductManagement', 'Analytics', ARRAY['product analytics', 'metrics', 'kpis', 'data-driven', 'measurement'], '3 hours', '2025-01-19', '2:00 PM', 'Kevin Zhang', 15, 5, 'Analytics Center'),

-- Sales & Business Development
('B2B Sales Mastery', 'Advanced techniques for closing enterprise deals', 'Sales', 'B2B', ARRAY['b2b sales', 'enterprise', 'closing', 'advanced', 'negotiation'], '4 hours', '2025-01-20', '9:00 AM', 'Richard Stone', 12, 4, 'Sales Training Room'),
('Sales Funnel Optimization', 'Optimize your sales process for maximum conversion', 'Sales', 'Process', ARRAY['sales funnel', 'optimization', 'conversion', 'process', 'intermediate'], '3 hours', '2025-01-20', '1:00 PM', 'Monica Williams', 15, 6, 'Process Lab'),
('CRM Systems & Sales Automation', 'Leverage technology to scale your sales operations', 'Sales', 'Technology', ARRAY['crm', 'sales automation', 'technology', 'scaling', 'efficiency'], '2.5 hours', '2025-01-21', '10:30 AM', 'Daniel Kim', 18, 8, 'Tech Center'),

-- Email Marketing
('Email Marketing Automation Mastery', 'Build sophisticated email funnels that nurture leads and drive sales', 'EmailMarketing', 'Automation', ARRAY['email', 'automation', 'funnels', 'intermediate', 'nurturing'], '3 hours', '2025-01-20', '10:30 AM', 'Jennifer Smith', 20, 9, 'Automation Lab'),
('Advanced Email Segmentation', 'Segment your audience for personalized, high-converting campaigns', 'EmailMarketing', 'Segmentation', ARRAY['email', 'segmentation', 'personalization', 'advanced', 'targeting'], '2 hours', '2025-01-20', '2:30 PM', 'Michael Brown', 18, 7, 'Marketing Analytics Room'),
('Email Design & Copywriting', 'Create beautiful, compelling emails that drive action', 'EmailMarketing', 'Design', ARRAY['email', 'design', 'copywriting', 'beginner', 'templates'], '2.5 hours', '2025-01-21', '1:00 PM', 'Sarah Martinez', 25, 14, 'Design Studio'),

-- Finance & Business
('Financial Modeling for Startups', 'Build comprehensive financial models for early-stage companies', 'Finance', 'Modeling', ARRAY['financial modeling', 'startups', 'forecasting', 'advanced', 'excel'], '4 hours', '2025-01-22', '9:00 AM', 'Robert Johnson', 12, 3, 'Finance Lab'),
('Investment Analysis & Valuation', 'Analyze investment opportunities and company valuations', 'Finance', 'Investment', ARRAY['investment', 'valuation', 'analysis', 'dcf', 'advanced'], '3.5 hours', '2025-01-22', '2:00 PM', 'Catherine Lee', 10, 2, 'Investment Center'),
('Business Plan Development', 'Create compelling business plans that attract investors', 'Finance', 'Planning', ARRAY['business plan', 'strategy', 'investors', 'intermediate', 'pitch'], '3 hours', '2025-01-23', '10:00 AM', 'David Wilson', 16, 6, 'Business Center');

-- Add some additional sessions to reach a good variety
INSERT INTO sessions (title, description, category, subcategory, tags, duration, date, time, instructor, capacity, enrolled, location) VALUES
-- More Web Development
('Progressive Web Apps (PWA)', 'Build web apps that work like native mobile applications', 'WebDevelopment', 'Frontend', ARRAY['pwa', 'mobile', 'web apps', 'service workers', 'intermediate'], '4 hours', '2025-01-18', '9:00 AM', 'Alex Rodriguez', 14, 5, 'Mobile Lab'),
('Microservices Architecture', 'Design and implement scalable microservices systems', 'WebDevelopment', 'Architecture', ARRAY['microservices', 'architecture', 'scalability', 'advanced', 'distributed'], '5 hours', '2025-01-18', '1:00 PM', 'Dr. James Liu', 10, 2, 'Architecture Lab'),
('Web Security Best Practices', 'Secure your web applications against common vulnerabilities', 'WebDevelopment', 'Security', ARRAY['security', 'vulnerabilities', 'best practices', 'intermediate', 'owasp'], '3 hours', '2025-01-19', '11:00 AM', 'Maria Santos', 16, 7, 'Security Lab'),

-- More Data Science
('Natural Language Processing', 'Process and analyze text data with NLP techniques', 'DataScience', 'NLP', ARRAY['nlp', 'text analysis', 'python', 'advanced', 'spacy'], '4.5 hours', '2025-01-18', '9:30 AM', 'Dr. Lisa Wang', 12, 4, 'NLP Lab'),
('Big Data with Apache Spark', 'Process large datasets efficiently with Apache Spark', 'DataScience', 'BigData', ARRAY['spark', 'big data', 'scala', 'advanced', 'distributed'], '5 hours', '2025-01-18', '2:00 PM', 'Thomas Anderson', 8, 2, 'Big Data Center'),

-- More Marketing
('Conversion Rate Optimization', 'Optimize your website and landing pages for better conversions', 'DigitalMarketing', 'CRO', ARRAY['cro', 'conversion', 'optimization', 'testing', 'intermediate'], '3 hours', '2025-01-21', '9:00 AM', 'Sophie Turner', 20, 11, 'Optimization Lab'),
('Influencer Marketing Strategy', 'Build successful influencer marketing campaigns', 'SocialMedia', 'Influencer', ARRAY['influencer marketing', 'partnerships', 'strategy', 'beginner', 'campaigns'], '2.5 hours', '2025-01-21', '2:00 PM', 'Jake Paul', 25, 15, 'Influencer Studio');

-- Sample booking data (optional - uncomment to add sample bookings)
/*
INSERT INTO bookings (session_id, booking_group_id, user_details, status) VALUES
(1, uuid_generate_v4(), '{"name": "John Doe", "email": "john@example.com", "company": "Tech Corp"}', 'confirmed'),
(2, uuid_generate_v4(), '{"name": "Jane Smith", "email": "jane@example.com", "company": "Marketing Inc"}', 'confirmed'),
(15, uuid_generate_v4(), '{"name": "Bob Johnson", "email": "bob@example.com", "company": "Dev Solutions"}', 'confirmed');
*/

-- Update some enrollment numbers to create realistic availability
UPDATE sessions SET enrolled = capacity - 2 WHERE id IN (5, 12, 18, 25);
UPDATE sessions SET enrolled = capacity - 1 WHERE id IN (8, 15, 22);
UPDATE sessions SET enrolled = capacity WHERE id IN (30, 35); -- Make some sessions full
