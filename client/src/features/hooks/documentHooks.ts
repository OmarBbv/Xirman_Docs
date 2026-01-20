import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentService } from "../services/documentServices";
import { message } from "antd";
import type {
  CreateDocumentDto,
  UpdateDocumentDto,
  FilterDocumentDto,
} from "../types/document.types";

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
  years: ['years'] as const,
};

export const useDocumentStats = () => {
  return useQuery({
    queryKey: documentKeys.stats,
    queryFn: () => documentService.getStats(),
  });
};

export const useDocuments = (filters?: FilterDocumentDto) => {
  return useQuery({
    queryKey: documentKeys.list(filters || {}),
    queryFn: () => documentService.getAll(filters),
  });
};

export const useMyDocuments = (filters?: FilterDocumentDto) => {
  return useQuery({
    queryKey: documentKeys.myDocs(filters || {}),
    queryFn: () => documentService.getMyDocuments(filters),
  });
};

export const useDocument = (id: number) => {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentService.getById(id),
    enabled: !!id,
  });
};

export const useDocumentViews = (id: number, search?: string) => {
  return useQuery({
    queryKey: [...documentKeys.views(id), search],
    queryFn: () => documentService.getViewHistory(id, search),
    enabled: !!id,
  });
};

export const useDocumentVersions = (id: number) => {
  return useQuery({
    queryKey: documentKeys.versions(id),
    queryFn: () => documentService.getVersions(id),
    enabled: !!id,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, files }: { data: CreateDocumentDto; files: File[] }) =>
      documentService.upload(data, files),
    onSuccess: () => {
      message.success("Sənəd uğurla yükləndi");
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

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

export const useDownloadAttachment = () => {
  return useMutation({
    mutationFn: ({ id, fileName }: { id: number; fileName: string }) =>
      documentService.downloadAttachment(id).then((blob) => {
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

export const useUpdateAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      documentService.updateAttachment(id, file),
    onSuccess: () => {
      message.success("Əlavə fayl uğurla yeniləndi");
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

export const useAddAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, file }: { documentId: number; file: File }) =>
      documentService.addAttachment(documentId, file),
    onSuccess: () => {
      message.success("Yeni fayl əlavə edildi");
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
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

export const useRecentActivities = () => {
  return useQuery({
    queryKey: documentKeys.activities,
    queryFn: () => documentService.getRecentActivities(),
    staleTime: 1000 * 60 * 1,
  });
};

export const useDocumentYears = () => {
  return useQuery({
    queryKey: documentKeys.years,
    queryFn: () => documentService.getYears(),
  });
};

// Şirkət folderləri (il üzrə)
export const useCompaniesForYear = (year: number | null) => {
  return useQuery({
    queryKey: ['companies', year],
    queryFn: () => documentService.getCompaniesByYear(year!),
    enabled: !!year,
  });
};
