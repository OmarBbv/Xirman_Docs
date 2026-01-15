import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { message } from "antd";

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: any) => [...userKeys.lists(), { ...filters }] as const,
};

export const useUsers = (search?: string, role?: string | null) => {
  return useQuery({
    queryKey: userKeys.list({ search, role }),
    queryFn: () => userService.getAll(search, role),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      message.success("İstifadəçi silindi");
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: () => {
      message.error("Xəta baş verdi");
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => userService.update(id, data),
    onSuccess: () => {
      message.success("Məlumatlar yeniləndi");
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: () => {
      message.error("Xəta baş verdi");
    }
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => userService.create(data),
    onSuccess: () => {
      message.success("İstifadəçi uğurla yaradıldı");
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Xəta baş verdi");
    }
  });
};
