// scripts/seedDeepAssessment.js
const path = require("path");

// Load environment variables - Fixed path
require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");

// Debug: Check if environment variables are loaded
console.log("Environment check:");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Loaded" : "NOT LOADED");
console.log("NODE_ENV:", process.env.NODE_ENV);
const { Category, Question, User } = require("../models");

const seedDeepAssessment = async () => {
  try {
    // Find an admin user to set as creator
    let adminUser = await User.findOne({ userRole: "Admin" });
    if (!adminUser) {
      // If no admin, find any user
      adminUser = await User.findOne();
      if (!adminUser) {
        // Create admin user if none exists
        adminUser = new User({
          firstName: "Admin",
          lastName: "PMAL",
          username: 'admin_seeder', // <-- REQUIRED FIELD ADDED
        password: 'DefaultPassword123!',
          email: "admin@pmal.com",
          userRole: "Admin",
          isActive: true,
        });
        await adminUser.save();
        console.log("👤 Created admin user for seeding");
      }
    }

    console.log("🌱 Starting Deep Assessment seeding...\n");

    // Deep Assessment Categories
    const deepCategories = [
      {
        name: "Gouvernance & Pilotage",
        description:
          "Questions relatives à la gouvernance projet et au pilotage",
        code: "GOV",
        phase: "All",
        weight: 1,
        quickAssessmentWeight: 1,
        deepAssessmentWeight: 1.2,
        order: 1,
        color: "#1e40af",
        icon: "fas fa-users",
        createdBy: adminUser._id,
      },
      {
        name: "Livrables Structurants",
        description:
          "Questions sur les livrables clés et la documentation structurante",
        code: "LIV",
        phase: "All",
        weight: 1,
        quickAssessmentWeight: 1,
        deepAssessmentWeight: 1.3,
        order: 2,
        color: "#059669",
        icon: "fas fa-file-alt",
        createdBy: adminUser._id,
      },
      {
        name: "Méthodologie & Process",
        description: "Questions sur les méthodologies et processus projet",
        code: "MET",
        phase: "All",
        weight: 1,
        quickAssessmentWeight: 1,
        deepAssessmentWeight: 1.1,
        order: 3,
        color: "#dc2626",
        icon: "fas fa-cogs",
        createdBy: adminUser._id,
      },
      {
        name: "Outils & Digital",
        description: "Questions sur les outils numériques et la digitalisation",
        code: "OUT",
        phase: "All",
        weight: 1,
        quickAssessmentWeight: 1,
        deepAssessmentWeight: 1.0,
        order: 4,
        color: "#7c3aed",
        icon: "fas fa-laptop",
        createdBy: adminUser._id,
      },
      {
        name: "Risques & Conformité",
        description: "Questions sur la gestion des risques et la conformité",
        code: "RIS",
        phase: "All",
        weight: 1,
        quickAssessmentWeight: 1,
        deepAssessmentWeight: 1.4,
        order: 5,
        color: "#ea580c",
        icon: "fas fa-shield-alt",
        createdBy: adminUser._id,
      },
      {
        name: "Module Spécifique",
        description: "Questions spécifiques à chaque module métier",
        code: "SPE",
        phase: "All",
        weight: 1,
        quickAssessmentWeight: 1,
        deepAssessmentWeight: 1.5,
        order: 6,
        color: "#0891b2",
        icon: "fas fa-star",
        createdBy: adminUser._id,
      },
    ];

    // Create or find categories
    const createdCategories = {};

    for (const categoryData of deepCategories) {
      let category = await Category.findOne({ code: categoryData.code });

      if (!category) {
        category = new Category(categoryData);
        await category.save();
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`ℹ️  Category ${category.name} already exists`);
      }

      createdCategories[categoryData.code] = category;
    }

    console.log(
      "📁 Categories processed:",
      Object.keys(createdCategories).length
    );

    // Deep Assessment Questions organized by Module, IRL Phase, and Question Family
    const deepQuestions = [];

    // PM Module - IRL1 Questions
    const govCategory = createdCategories["GOV"];
    const livCategory = createdCategories["LIV"];
    const metCategory = createdCategories["MET"];
    const outCategory = createdCategories["OUT"];
    const risCategory = createdCategories["RIS"];
    const speCategory = createdCategories["SPE"];

    // PM - IRL1 - Gouvernance_Pilotage
    deepQuestions.push(
      {
        text: "Une équipe projet est-elle formellement constituée avec des rôles et responsabilités définis ?",
        category: govCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Aucune équipe formellement définie", value: 1 },
          {
            text: "Équipe partiellement définie avec quelques rôles",
            value: 2,
          },
          {
            text: "Équipe complètement définie avec rôles et responsabilités clairs",
            value: 3,
          },
        ],
        assessmentType: "deep",
        phase: "All",
        difficulty: "Hard",
        weight: 3,
        order: 1,
        module: "PM",
        irlPhase: "IRL1",
        questionFamily: "Gouvernance_Pilotage",
        criticality: 3,
        impactAreas: ["Technical", "Commercial"],
        createdBy: adminUser._id,
      },
      {
        text: "Les objectifs et le périmètre du projet sont-ils clairement définis et partagés ?",
        category: govCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Objectifs flous et non documentés", value: 1 },
          { text: "Objectifs partiellement définis", value: 2 },
          { text: "Objectifs clairs, documentés et partagés", value: 3 },
        ],
        assessmentType: "deep",
        phase: "All",
        difficulty: "Hard",
        weight: 3,
        order: 2,
        module: "PM",
        irlPhase: "IRL1",
        questionFamily: "Gouvernance_Pilotage",
        criticality: 3,
        impactAreas: ["Technical", "Commercial"],
        createdBy: adminUser._id,
      }
    );

    // PM - IRL1 - Livrables_Structurants
    deepQuestions.push(
      {
        text: "Disposez-vous d'une charte projet formalisée et approuvée ?",
        category: livCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Pas de charte projet", value: 1 },
          { text: "Charte en cours d'élaboration", value: 2 },
          { text: "Charte complète et approuvée", value: 3 },
        ],
        assessmentType: "deep",
        phase: "All",
        difficulty: "Medium",
        weight: 2,
        order: 3,
        module: "PM",
        irlPhase: "IRL1",
        questionFamily: "Livrables_Structurants",
        criticality: 2,
        impactAreas: ["Technical", "Commercial"],
        createdBy: adminUser._id,
      },
      {
        text: "Un dossier de définition projet existe-t-il avec les exigences initiales ?",
        category: livCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Aucun dossier de définition", value: 1 },
          { text: "Dossier partiel ou en cours", value: 2 },
          { text: "Dossier complet et validé", value: 3 },
        ],
        assessmentType: "deep",
        phase: "All",
        difficulty: "Medium",
        weight: 2,
        order: 4,
        module: "PM",
        irlPhase: "IRL1",
        questionFamily: "Livrables_Structurants",
        criticality: 2,
        impactAreas: ["Technical", "Commercial"],
        createdBy: adminUser._id,
      }
    );

    // PM - IRL1 - Methodologie_Process
    deepQuestions.push({
      text: "Une méthodologie de gestion de projet est-elle définie et appliquée ?",
      category: metCategory._id,
      type: "multiple-choice",
      options: [
        { text: "Aucune méthodologie formelle", value: 1 },
        { text: "Méthodologie partiellement définie", value: 2 },
        { text: "Méthodologie complète et appliquée", value: 3 },
      ],
      assessmentType: "deep",
      phase: "All",
      difficulty: "Medium",
      weight: 2,
      order: 5,
      module: "PM",
      irlPhase: "IRL1",
      questionFamily: "Methodologie_Process",
      criticality: 2,
      impactAreas: ["Technical", "Commercial"],
      createdBy: adminUser._id,
    });

    // PM - IRL1 - Outils_Digital
    deepQuestions.push({
      text: "Des outils de collaboration et de partage d'information sont-ils mis en place ?",
      category: outCategory._id,
      type: "multiple-choice",
      options: [
        { text: "Pas d'outils collaboratifs", value: 1 },
        { text: "Outils basiques mis en place", value: 2 },
        { text: "Outils collaboratifs complets et utilisés", value: 3 },
      ],
      assessmentType: "deep",
      phase: "All",
      difficulty: "Easy",
      weight: 1,
      order: 6,
      module: "PM",
      irlPhase: "IRL1",
      questionFamily: "Outils_Digital",
      criticality: 1,
      impactAreas: ["Technical", "Commercial"],
      createdBy: adminUser._id,
    });

    // PM - IRL1 - Risques_Conformite
    deepQuestions.push({
      text: "Une identification préliminaire des risques projet a-t-elle été réalisée ?",
      category: risCategory._id,
      type: "multiple-choice",
      options: [
        { text: "Aucune identification des risques", value: 1 },
        { text: "Identification partielle des risques majeurs", value: 2 },
        {
          text: "Identification systématique et documentation des risques",
          value: 3,
        },
      ],
      assessmentType: "deep",
      phase: "All",
      difficulty: "Medium",
      weight: 2,
      order: 7,
      module: "PM",
      irlPhase: "IRL1",
      questionFamily: "Risques_Conformite",
      criticality: 2,
      impactAreas: ["Technical", "Commercial"],
      createdBy: adminUser._id,
    });

    // PM - IRL1 - Module_Specifique
    deepQuestions.push({
      text: "Les standards et bonnes pratiques PM sont-ils identifiés pour le projet ?",
      category: speCategory._id,
      type: "multiple-choice",
      options: [
        { text: "Aucun standard identifié", value: 1 },
        { text: "Standards partiellement identifiés", value: 2 },
        { text: "Standards complets identifiés et documentés", value: 3 },
      ],
      assessmentType: "deep",
      phase: "All",
      difficulty: "Medium",
      weight: 2,
      order: 8,
      module: "PM",
      irlPhase: "IRL1",
      questionFamily: "Module_Specifique",
      criticality: 2,
      impactAreas: ["Technical", "Commercial"],
      createdBy: adminUser._id,
    });

    // Engineering Module - IRL1 Questions
    deepQuestions.push(
      {
        text: "Une équipe technique pluridisciplinaire est-elle constituée ?",
        category: govCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Pas d'équipe technique définie", value: 1 },
          { text: "Équipe partielle avec quelques disciplines", value: 2 },
          { text: "Équipe complète pluridisciplinaire", value: 3 },
        ],
        assessmentType: "deep",
        phase: "All",
        difficulty: "Hard",
        weight: 3,
        order: 9,
        module: "Engineering",
        irlPhase: "IRL1",
        questionFamily: "Gouvernance_Pilotage",
        criticality: 3,
        impactAreas: ["Technical"],
        createdBy: adminUser._id,
      },
      {
        text: "Les exigences techniques sont-elles formalisées et tracées ?",
        category: livCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Pas d'exigences formalisées", value: 1 },
          { text: "Exigences partiellement documentées", value: 2 },
          { text: "Exigences complètes et tracées", value: 3 },
        ],
        assessmentType: "deep",
        phase: "All",
        difficulty: "Hard",
        weight: 3,
        order: 10,
        module: "Engineering",
        irlPhase: "IRL1",
        questionFamily: "Livrables_Structurants",
        criticality: 3,
        impactAreas: ["Technical"],
        createdBy: adminUser._id,
      }
    );

    // HSE Module - IRL1 Questions
    deepQuestions.push(
      {
        text: "Un responsable HSE est-il désigné pour le projet ?",
        category: govCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Pas de responsable HSE désigné", value: 1 },
          { text: "Responsabilité HSE partagée", value: 2 },
          { text: "Responsable HSE dédié et formalisé", value: 3 },
        ],
        assessmentType: "deep",
        phase: "All",
        difficulty: "Hard",
        weight: 3,
        order: 11,
        module: "HSE",
        irlPhase: "IRL1",
        questionFamily: "Gouvernance_Pilotage",
        criticality: 3,
        impactAreas: ["Regulatory", "Operational"],
        createdBy: adminUser._id,
      },
      {
        text: "Une politique HSE projet est-elle définie et communiquée ?",
        category: livCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Pas de politique HSE", value: 1 },
          { text: "Politique HSE basique", value: 2 },
          { text: "Politique HSE complète et communiquée", value: 3 },
        ],
        assessmentType: "deep",
        phase: "All",
        difficulty: "Hard",
        weight: 3,
        order: 12,
        module: "HSE",
        irlPhase: "IRL1",
        questionFamily: "Livrables_Structurants",
        criticality: 3,
        impactAreas: ["Regulatory", "Operational"],
        createdBy: adminUser._id,
      }
    );

    // O&M_DOI Module - IRL1 Questions
    deepQuestions.push(
      {
        text: "Les futurs utilisateurs/exploitants sont-ils impliqués dès la conception ?",
        category: govCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Pas d'implication des futurs exploitants", value: 1 },
          { text: "Consultation ponctuelle", value: 2 },
          { text: "Implication active et continue", value: 3 },
        ],
        assessmentType: "deep",
        phase: "All",
        difficulty: "Hard",
        weight: 3,
        order: 13,
        module: "O&M_DOI",
        irlPhase: "IRL1",
        questionFamily: "Gouvernance_Pilotage",
        criticality: 3,
        impactAreas: ["Operational", "Financial"],
        createdBy: adminUser._id,
      },
      {
        text: "Les exigences d'exploitation et de maintenance sont-elles spécifiées ?",
        category: livCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Pas d'exigences O&M définies", value: 1 },
          { text: "Exigences O&M partielles", value: 2 },
          { text: "Exigences O&M complètes et documentées", value: 3 },
        ],
        assessmentType: "deep",
        phase: "All",
        difficulty: "Hard",
        weight: 3,
        order: 14,
        module: "O&M_DOI",
        irlPhase: "IRL1",
        questionFamily: "Livrables_Structurants",
        criticality: 3,
        impactAreas: ["Operational", "Financial"],
        createdBy: adminUser._id,
      }
    );

    // Insert all questions
    let createdQuestions = 0;

    for (const questionData of deepQuestions) {
      try {
        // Check if question already exists
        const existingQuestion = await Question.findOne({
          text: questionData.text,
          module: questionData.module,
          irlPhase: questionData.irlPhase,
          questionFamily: questionData.questionFamily,
        });

        if (!existingQuestion) {
          const question = new Question(questionData);
          await question.save();
          createdQuestions++;
        }
      } catch (error) {
        console.error(
          `❌ Error creating question: ${questionData.text.substring(
            0,
            50
          )}...`,
          error.message
        );
      }
    }

    console.log("❓ Questions created:", createdQuestions);

    // Update category question counts
    console.log("\n📊 Updating category question counts...");
    for (const category of Object.values(createdCategories)) {
      await category.updateQuestionCount();
    }

    console.log("\n🎉 Deep Assessment seeding completed successfully!");
    console.log(`📁 Categories: ${Object.keys(createdCategories).length}`);
    console.log(`❓ Questions: ${createdQuestions}`);
    console.log(`🔧 Modules: 4 (PM, Engineering, HSE, O&M_DOI)`);
    console.log(`📊 IRL Phases: IRL1 (can be extended to IRL1-IRL6)`);
    console.log(`📋 Question Families: 6 families per phase`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
};

module.exports = seedDeepAssessment;

// If running directly
if (require.main === module) {
  const connectDB = require("../config/database");

  connectDB().then(() => {
    seedDeepAssessment()
      .then(() => {
        console.log("✅ Deep Assessment seeding complete");
        process.exit(0);
      })
      .catch((err) => {
        console.error("❌ Deep Assessment seeding failed:", err);
        process.exit(1);
      });
  });
}
