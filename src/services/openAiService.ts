import { supabase } from "@/integrations/supabase/client";

export const getEphemeralToken = async (voice: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('get-openai-token', {
      body: { voice },
    });
    
    if (error) {
      console.error('Error getting ephemeral token:', error);
      throw error;
    }
    
    if (!data?.token) {
      throw new Error('No token received from the server');
    }
    
    return data.token;
  } catch (error) {
    console.error('Failed to get ephemeral token:', error);
    throw error;
  }
};