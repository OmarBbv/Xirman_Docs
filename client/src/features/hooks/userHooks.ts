import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { message } from "antd";

export const userKeys = {
  all: ['users'] as const,
};

export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => userService.getAll(),
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
