import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentService } from "../services/documentServices";
import { message } from "antd";
import type {
  CreateDocumentDto,
  UpdateDocumentDto,
  FilterDocumentDto,
} from "../types/document.types";

// Query Keys
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (filters: FilterDocumentDto) => [...documentKeys.lists(), filters] as const,
  myDocs: (filters: FilterDocumentDto) => [...documentKeys.all, "my", filters] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: number) => [...documentKeys.details(), id] as const,
  view: (id: number) => [...documentKeys.detail(id), 'view'] as const,
  views: (id: number) => [...documentKeys.all, "views", id] as const,
  versions: (id: number) => [...documentKeys.detail(id), 'versions'] as const,
  stats: ['stats'] as const,
  activities: ['activities'] as const,
};

// Statistika Hook-u
export const useDocumentStats = () => {
  return useQuery({
    queryKey: documentKeys.stats,
    queryFn: () => documentService.getStats(),
  });
};

// Bütün sənədləri gətir
export const useDocuments = (filters?: FilterDocumentDto) => {
  return useQuery({
    queryKey: documentKeys.list(filters || {}),
    queryFn: () => documentService.getAll(filters),
  });
};

// Mənim sənədlərim
export const useMyDocuments = (filters?: FilterDocumentDto) => {
  return useQuery({
    queryKey: documentKeys.myDocs(filters || {}),
    queryFn: () => documentService.getMyDocuments(filters),
  });
};

// Tək sənəd
export const useDocument = (id: number) => {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentService.getById(id),
    enabled: !!id,
  });
};

// Baxış tarixçəsi
export const useDocumentViews = (id: number, search?: string) => {
  return useQuery({
    queryKey: [...documentKeys.views(id), search],
    queryFn: () => documentService.getViewHistory(id, search),
    enabled: !!id,
  });
};

// Versiyalar
export const useDocumentVersions = (id: number) => {
  return useQuery({
    queryKey: documentKeys.versions(id),
    queryFn: () => documentService.getVersions(id),
    enabled: !!id,
  });
};

// Sənəd yüklə
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, file }: { data: CreateDocumentDto; file: File }) =>
      documentService.upload(data, file),
    onSuccess: () => {
      message.success("Sənəd uğurla yükləndi");
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

// Sənədi sil
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => documentService.delete(id),
    onSuccess: () => {
      message.success("Sənəd uğurla silindi");
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

// Sənədi yüklə (download)
export const useDownloadDocument = () => {
  return useMutation({
    mutationFn: ({ id, fileName }: { id: number; fileName: string }) =>
      documentService.download(id).then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return blob;
      }),
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

export const useDownloadVersion = () => {
  return useMutation({
    mutationFn: ({ id, fileName }: { id: number; fileName: string }) =>
      documentService.downloadVersion(id).then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return blob;
      }),
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => documentService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, file }: { id: number; data: UpdateDocumentDto; file?: File }) =>
      documentService.update(id, data, file),
    onSuccess: (_, variables) => {
      message.success("Sənəd uğurla yeniləndi");
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: documentKeys.versions(variables.id) });
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

// Son aktivliklər
export const useRecentActivities = () => {
  return useQuery({
    queryKey: documentKeys.activities,
    queryFn: () => documentService.getRecentActivities(),
    staleTime: 1000 * 60 * 1, // 1 dəqiqə
  });
};
