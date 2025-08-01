#!/bin/sh

# This script runs the database seeders

echo "🌱 Starting database seeding..."

# Run the seed scripts
node scripts/seedDeepAssessment.js
node scripts/seedQuickAssessment.js

echo "✅ Database seeding completed."