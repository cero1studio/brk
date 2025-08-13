import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are not set")
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
)

// Test Supabase connection
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.log("🧪 Testing Supabase connection...")
    console.log("URL:", supabaseUrl)
    console.log("Key exists:", !!supabaseAnonKey)

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ Supabase credentials not configured")
      return false
    }

    // Test with a simple query
    const { data, error } = await supabase.from("products").select("count", { count: "exact", head: true })

    if (error) {
      console.error("❌ Supabase connection test failed:", error.message)
      return false
    }

    console.log("✅ Supabase connection successful")
    return true
  } catch (error) {
    console.error("❌ Supabase connection error:", error)
    return false
  }
}

// Initialize tables if they don't exist
export async function initializeTables(): Promise<boolean> {
  try {
    console.log("🔧 Initializing Supabase tables...")

    // Check if products table exists
    const { error: productsError } = await supabase.from("products").select("id").limit(1)

    if (productsError) {
      console.error("❌ Products table not found:", productsError.message)
      return false
    }

    console.log("✅ Tables initialized successfully")
    return true
  } catch (error) {
    console.error("❌ Error initializing tables:", error)
    return false
  }
}
