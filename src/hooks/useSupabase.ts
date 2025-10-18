import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

// هوك عام للتعامل مع Supabase
export function useSupabase() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeQuery = async <T>(
    queryFn: () => Promise<{ data: T | null; error: unknown }>
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await queryFn()
      if (error) throw error
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { executeQuery, loading, error }
}

// هوك لجلب البيانات
export function useFetchData<T>(table: string, select = '*') {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: result, error } = await supabase
        .from(table)
        .select(select)
      if (error) throw error
      setData(result as T[] || [])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [table, select])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// هوك للإدراج
export function useInsertData(table: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const insert = async (data: Record<string, unknown>) => {
    setLoading(true)
    setError(null)
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select()
      if (error) throw error
      return result
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { insert, loading, error }
}
