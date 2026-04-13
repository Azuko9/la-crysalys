"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Project, Category } from "@/types";

export function useProjects(initialProjects: Project[], initialCategories: Category[]) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchProjects = useCallback(async (filterFn?: (query: any) => any) => {
    let query = supabase.from('portfolio_items').select('*').order('project_date', { ascending: false });
    if (filterFn) {
      query = filterFn(query);
    }
    const { data, error } = await query;
    if (!error) {
      setProjects((data as Project[]) || []);
    } else {
      console.error("Error fetching projects:", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
    setCategories((data as Category[]) || []);
  }, []);

  const openModal = (project: Project | null) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProjectToEdit(null);
  };

  const handleModalSuccess = (fetchFn: () => void) => {
    closeModal();
    fetchFn();
  };

  return {
    projects, categories, isModalOpen, projectToEdit,
    fetchProjects, fetchCategories, openModal, closeModal, handleModalSuccess,
  };
}