export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface PostProdDetail {
  detail: string;
  before_url: string;
  after_url: string;
}

export interface Project {
  id: string;
  created_at: string;
  title: string;
  youtube_url: string;
  description: string | null;
  description_drone: string | null;
  description_postprod: PostProdDetail[] | null;
  client_name: string | null;
  client_website: string | null;
  project_date: string;
  thumbnail_url: string | null;
  postprod_before_url: string | null;
  postprod_after_url: string | null;
  postprod_main_description: string | null;
  category: string;
}

export interface TeamMember {
  id: string;
  created_at: string;
  name: string;
  role: string;
  company: string | null;
  bio: string | null;
  photo_url: string | null;
  instagram: string | null;
  linkedin: string | null;
  email: string | null;
  website: string | null;
  member_type: 'team' | 'partner';
}

export interface Feature {
  id: string;
  created_at: string;
  title: string;
  description: string;
  icon_name: string;
  page_context: string;
}