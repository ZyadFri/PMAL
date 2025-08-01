    import React, { createContext, useContext, useReducer, useCallback } from 'react';
import api from '../services/api';

const ProjectContext = createContext();

const initialState = {
  projects: [],
  currentProject: null,
  stats: null,
  isLoading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  }
};

const projectReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PROJECTS':
      return {
        ...state,
        projects: action.payload.projects,
        pagination: action.payload.pagination,
        isLoading: false,
        error: null
      };
    case 'SET_CURRENT_PROJECT':
      return {
        ...state,
        currentProject: action.payload,
        isLoading: false,
        error: null
      };
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [action.payload, ...state.projects],
        isLoading: false,
        error: null
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project._id === action.payload._id ? action.payload : project
        ),
        currentProject: state.currentProject?._id === action.payload._id
          ? action.payload
          : state.currentProject,
        isLoading: false,
        error: null
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project._id !== action.payload),
        currentProject: state.currentProject?._id === action.payload ? null : state.currentProject,
        isLoading: false,
        error: null
      };
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload,
        isLoading: false,
        error: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const fetchProjects = useCallback(async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.get('/projects', { params });
      dispatch({
        type: 'SET_PROJECTS',
        payload: response.data.data
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch projects'
      });
    }
  }, []);

  const fetchProjectById = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.get(`/projects/${id}`);
      dispatch({
        type: 'SET_CURRENT_PROJECT',
        payload: response.data.data.project
      });
      return response.data.data.project;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch project'
      });
      return null;
    }
  }, []);

  const createProject = async (projectData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/projects', projectData);
      dispatch({
        type: 'ADD_PROJECT',
        payload: response.data.data.project
      });
      return { success: true, project: response.data.data.project };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create project';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.put(`/projects/${id}`, projectData);
      dispatch({
        type: 'UPDATE_PROJECT',
        payload: response.data.data.project
      });
      return { success: true, project: response.data.data.project };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update project';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const deleteProject = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await api.delete(`/projects/${id}`);
      dispatch({
        type: 'DELETE_PROJECT',
        payload: id
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete project';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const addTeamMember = async (projectId, memberData) => {
    try {
      const response = await api.post(`/projects/${projectId}/team`, memberData);
      dispatch({
        type: 'UPDATE_PROJECT',
        payload: response.data.data.project
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add team member'
      };
    }
  };

  const removeTeamMember = async (projectId, memberId) => {
    try {
      await api.delete(`/projects/${projectId}/team/${memberId}`);
      // Refresh the project to get updated team
      await fetchProjectById(projectId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove team member'
      };
    }
  };

  const fetchProjectStats = async () => {
    try {
      const response = await api.get('/projects/stats');
      dispatch({
        type: 'SET_STATS',
        payload: response.data.data
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch project statistics'
      });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearCurrentProject = () => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
  };

  const value = {
    ...state,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    addTeamMember,
    removeTeamMember,
    fetchProjectStats,
    clearError,
    clearCurrentProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectContext;