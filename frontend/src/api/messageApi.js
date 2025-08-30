import apiClient from "./apiClient";

export const fetchMessages = async (conversationId) => {
  const response = await apiClient.get(`/conversations/${conversationId}/messages`);
  return response.data;
};
