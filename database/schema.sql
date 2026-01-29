-- ============================================
-- NUTRITION TRACKING APP - DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USERS TABLE (Authentication & Roles)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'client' 
        CHECK (role IN ('admin', 'client')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- ============================================
-- 2. CLIENT_PROFILES TABLE (Extended Info)
-- ============================================
CREATE TABLE IF NOT EXISTS client_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('Men', 'Women', 'Other')),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    activity_level VARCHAR(20) CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON client_profiles(user_id);

-- ============================================
-- 3. HEALTH_GOALS TABLE (Structured Goals)
-- ============================================
CREATE TABLE IF NOT EXISTS health_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN (
        'weight_loss', 
        'weight_gain', 
        'muscle_gain', 
        'fitness', 
        'maintenance',
        'diabetes_management',
        'heart_health',
        'digestive_health',
        'energy_optimization',
        'athletic_performance',
        'custom'
    )),
    goal_name VARCHAR(255),
    target_weight_kg DECIMAL(5,2),
    current_weight_kg DECIMAL(5,2),
    target_date DATE,
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_goals_user_id ON health_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_health_goals_active ON health_goals(user_id, is_active) WHERE is_active = TRUE;

-- ============================================
-- 4. NUTRITION_GOALS TABLE (Target Goals)
-- ============================================
CREATE TABLE IF NOT EXISTS nutrition_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    health_goal_id UUID REFERENCES health_goals(id) ON DELETE SET NULL,
    calories_target DECIMAL(8,2) NOT NULL,
    protein_target DECIMAL(8,2) NOT NULL DEFAULT 0,
    carbs_target DECIMAL(8,2) NOT NULL DEFAULT 0,
    fats_target DECIMAL(8,2) NOT NULL DEFAULT 0,
    fiber_target DECIMAL(8,2) DEFAULT 0,
    sodium_target DECIMAL(8,2) DEFAULT 0,
    sugar_target DECIMAL(8,2) DEFAULT 0,
    water_target DECIMAL(8,2) DEFAULT 0,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_nutrition_goals_user_id ON nutrition_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_goals_active ON nutrition_goals(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_nutrition_goals_dates ON nutrition_goals(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_nutrition_goals_health_goal ON nutrition_goals(health_goal_id);

-- ============================================
-- 5. ALLERGIES TABLE (Critical for Safety)
-- ============================================
CREATE TABLE IF NOT EXISTS allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    allergen_name VARCHAR(255) NOT NULL,
    allergen_category VARCHAR(50),
    severity VARCHAR(20) NOT NULL DEFAULT 'moderate' 
        CHECK (severity IN ('mild', 'moderate', 'severe', 'life_threatening')),
    reaction_description TEXT,
    diagnosed_by VARCHAR(255),
    diagnosed_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, allergen_name)
);

CREATE INDEX IF NOT EXISTS idx_allergies_user_id ON allergies(user_id);
CREATE INDEX IF NOT EXISTS idx_allergies_active ON allergies(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_allergies_severity ON allergies(user_id, severity);

-- ============================================
-- 6. HEALTH_CONDITIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS health_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    condition_name VARCHAR(255) NOT NULL,
    condition_category VARCHAR(50),
    diagnosis_date DATE,
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe')),
    is_managed BOOLEAN DEFAULT TRUE,
    management_notes TEXT,
    doctor_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_conditions_user_id ON health_conditions(user_id);
CREATE INDEX IF NOT EXISTS idx_health_conditions_active ON health_conditions(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_health_conditions_category ON health_conditions(user_id, condition_category);

-- ============================================
-- 7. DIETARY_RESTRICTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS dietary_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restriction_type VARCHAR(50) NOT NULL CHECK (restriction_type IN (
        'vegetarian',
        'vegan',
        'pescatarian',
        'keto',
        'paleo',
        'low_carb',
        'low_sodium',
        'low_sugar',
        'halal',
        'kosher',
        'gluten_free',
        'dairy_free',
        'custom'
    )),
    restriction_name VARCHAR(255),
    strictness VARCHAR(20) DEFAULT 'moderate' 
        CHECK (strictness IN ('flexible', 'moderate', 'strict')),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dietary_restrictions_user_id ON dietary_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_dietary_restrictions_active ON dietary_restrictions(user_id, is_active) WHERE is_active = TRUE;

-- ============================================
-- 8. MEALS TABLE (Meal Records)
-- ============================================
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_type VARCHAR(20) NOT NULL 
        CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'early_am')),
    meal_date DATE NOT NULL,
    input_method VARCHAR(20) 
        CHECK (input_method IN ('voice', 'text', 'image', 'barcode', 'manual')),
    total_calories DECIMAL(8,2) DEFAULT 0,
    total_protein DECIMAL(8,2) DEFAULT 0,
    total_carbs DECIMAL(8,2) DEFAULT 0,
    total_fats DECIMAL(8,2) DEFAULT 0,
    total_fiber DECIMAL(8,2) DEFAULT 0,
    total_sodium DECIMAL(8,2) DEFAULT 0,
    total_sugar DECIMAL(8,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_meal_per_day UNIQUE(user_id, meal_date, meal_type)
);

CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, meal_date);
CREATE INDEX IF NOT EXISTS idx_meals_user_type ON meals(user_id, meal_type);
CREATE INDEX IF NOT EXISTS idx_meals_date_range ON meals(user_id, meal_date DESC);
CREATE INDEX IF NOT EXISTS idx_meals_user_date_type ON meals(user_id, meal_date, meal_type);

-- ============================================
-- 9. MEAL_ITEMS TABLE (Individual Food Items)
-- ============================================
CREATE TABLE IF NOT EXISTS meal_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    food_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(8,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    calories DECIMAL(8,2) NOT NULL DEFAULT 0,
    protein DECIMAL(8,2) DEFAULT 0,
    carbs DECIMAL(8,2) DEFAULT 0,
    fats DECIMAL(8,2) DEFAULT 0,
    fiber DECIMAL(8,2) DEFAULT 0,
    sugar DECIMAL(8,2) DEFAULT 0,
    sodium DECIMAL(8,2) DEFAULT 0,
    barcode VARCHAR(50),
    source_image_url TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    is_edited BOOLEAN DEFAULT FALSE,
    allergen_warnings JSONB DEFAULT '[]'::JSONB,
    health_condition_warnings JSONB DEFAULT '[]'::JSONB,
    dietary_restriction_violations JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meal_items_meal_id ON meal_items(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_items_food_name ON meal_items(food_name);
CREATE INDEX IF NOT EXISTS idx_meal_items_barcode ON meal_items(barcode) WHERE barcode IS NOT NULL;

-- ============================================
-- 10. DAILY_NUTRITION_SUMMARY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_nutrition_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    total_calories DECIMAL(8,2) DEFAULT 0,
    total_protein DECIMAL(8,2) DEFAULT 0,
    total_carbs DECIMAL(8,2) DEFAULT 0,
    total_fats DECIMAL(8,2) DEFAULT 0,
    total_fiber DECIMAL(8,2) DEFAULT 0,
    total_sodium DECIMAL(8,2) DEFAULT 0,
    total_sugar DECIMAL(8,2) DEFAULT 0,
    total_water DECIMAL(8,2) DEFAULT 0,
    meal_count INTEGER DEFAULT 0,
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, summary_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_summary_user_date ON daily_nutrition_summary(user_id, summary_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_summary_date_range ON daily_nutrition_summary(user_id, summary_date);

-- ============================================
-- 11. USER_PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_input_method VARCHAR(20) DEFAULT 'voice',
    typical_breakfast TEXT,
    typical_lunch TEXT,
    typical_dinner TEXT,
    common_foods JSONB,
    portion_preferences JSONB,
    correction_history JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_common_foods ON user_preferences USING GIN(common_foods);

-- ============================================
-- 12. ALLERGY_ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS allergy_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_id UUID REFERENCES meals(id) ON DELETE SET NULL,
    allergen_id UUID NOT NULL REFERENCES allergies(id) ON DELETE CASCADE,
    detected_item VARCHAR(255),
    alert_level VARCHAR(20) NOT NULL DEFAULT 'warning' 
        CHECK (alert_level IN ('info', 'warning', 'critical')),
    was_consumed BOOLEAN DEFAULT FALSE,
    user_acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_allergy_alerts_user_id ON allergy_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_allergy_alerts_meal_id ON allergy_alerts(meal_id);
CREATE INDEX IF NOT EXISTS idx_allergy_alerts_unacknowledged ON allergy_alerts(user_id, user_acknowledged) WHERE user_acknowledged = FALSE;

-- ============================================
-- 13. WEIGHT_TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weight_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2) NOT NULL,
    measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, measurement_date)
);

CREATE INDEX IF NOT EXISTS idx_weight_tracking_user_date ON weight_tracking(user_id, measurement_date DESC);

-- ============================================
-- 14. MEAL_TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meal_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'early_am')),
    items JSONB NOT NULL,
    total_calories DECIMAL(8,2),
    is_favorite BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meal_templates_user_id ON meal_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_templates_favorite ON meal_templates(user_id, is_favorite) WHERE is_favorite = TRUE;

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_profiles_updated_at ON client_profiles;
CREATE TRIGGER update_client_profiles_updated_at BEFORE UPDATE ON client_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nutrition_goals_updated_at ON nutrition_goals;
CREATE TRIGGER update_nutrition_goals_updated_at BEFORE UPDATE ON nutrition_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meals_updated_at ON meals;
CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meal_items_updated_at ON meal_items;
CREATE TRIGGER update_meal_items_updated_at BEFORE UPDATE ON meal_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to recalculate meal totals
CREATE OR REPLACE FUNCTION recalculate_meal_totals(meal_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE meals
    SET 
        total_calories = COALESCE((SELECT SUM(calories) FROM meal_items WHERE meal_id = meal_id_param), 0),
        total_protein = COALESCE((SELECT SUM(protein) FROM meal_items WHERE meal_id = meal_id_param), 0),
        total_carbs = COALESCE((SELECT SUM(carbs) FROM meal_items WHERE meal_id = meal_id_param), 0),
        total_fats = COALESCE((SELECT SUM(fats) FROM meal_items WHERE meal_id = meal_id_param), 0),
        total_fiber = COALESCE((SELECT SUM(fiber) FROM meal_items WHERE meal_id = meal_id_param), 0),
        total_sodium = COALESCE((SELECT SUM(sodium) FROM meal_items WHERE meal_id = meal_id_param), 0),
        total_sugar = COALESCE((SELECT SUM(sugar) FROM meal_items WHERE meal_id = meal_id_param), 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = meal_id_param;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update meal totals
CREATE OR REPLACE FUNCTION trigger_recalculate_meal_totals()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM recalculate_meal_totals(COALESCE(NEW.meal_id, OLD.meal_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS meal_items_recalculate_totals ON meal_items;
CREATE TRIGGER meal_items_recalculate_totals
    AFTER INSERT OR UPDATE OR DELETE ON meal_items
    FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_meal_totals();

-- Function to update daily summary
CREATE OR REPLACE FUNCTION update_daily_summary(user_id_param UUID, summary_date_param DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_nutrition_summary (
        user_id, summary_date,
        total_calories, total_protein, total_carbs, total_fats,
        total_fiber, total_sodium, total_sugar,
        meal_count, last_calculated_at
    )
    SELECT 
        user_id_param,
        summary_date_param,
        COALESCE(SUM(total_calories), 0),
        COALESCE(SUM(total_protein), 0),
        COALESCE(SUM(total_carbs), 0),
        COALESCE(SUM(total_fats), 0),
        COALESCE(SUM(total_fiber), 0),
        COALESCE(SUM(total_sodium), 0),
        COALESCE(SUM(total_sugar), 0),
        COUNT(*),
        CURRENT_TIMESTAMP
    FROM meals
    WHERE user_id = user_id_param AND meal_date = summary_date_param
    ON CONFLICT (user_id, summary_date)
    DO UPDATE SET
        total_calories = EXCLUDED.total_calories,
        total_protein = EXCLUDED.total_protein,
        total_carbs = EXCLUDED.total_carbs,
        total_fats = EXCLUDED.total_fats,
        total_fiber = EXCLUDED.total_fiber,
        total_sodium = EXCLUDED.total_sodium,
        total_sugar = EXCLUDED.total_sugar,
        meal_count = EXCLUDED.meal_count,
        last_calculated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update daily summary
CREATE OR REPLACE FUNCTION trigger_update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_daily_summary(
        COALESCE(NEW.user_id, OLD.user_id),
        COALESCE(NEW.meal_date, OLD.meal_date)
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS meals_update_daily_summary ON meals;
CREATE TRIGGER meals_update_daily_summary
    AFTER INSERT OR UPDATE OR DELETE ON meals
    FOR EACH ROW EXECUTE FUNCTION trigger_update_daily_summary();
