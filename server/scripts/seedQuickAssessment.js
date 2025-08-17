// scripts/seedQuickAssessment.js
// Load environment variables
require("dotenv").config({ path: "../.env" });
const { Category, Question, User } = require("../models");

const seedQuickAssessment = async () => {
  try {
    // Find an admin user to set as creator
    let adminUser = await User.findOne({ userRole: "Admin" });
    if (!adminUser) {
      // If no admin, find any user
      adminUser = await User.findOne();
      if (!adminUser) {
        console.log("No users found. Please create a user first.");
        return;
      }
    }

    // Clear existing data
    await Category.deleteMany({});
    await Question.deleteMany({});

    // Create Categories
    const categories = [
      {
        name: "Générale",
        description: "Questions générales sur le projet",
        code: "GEN",
        phase: "All",
        weight: 1,
        quickAssessmentWeight: 1,
        deepAssessmentWeight: 1,
        order: 1,
        color: "#3B82F6",
        createdBy: adminUser._id,
      },
      {
        name: "Stratégie & Business Model",
        description: "Stratégie et modèle économique du projet",
        code: "SBM",
        phase: "All",
        weight: 1.2,
        quickAssessmentWeight: 1.2,
        deepAssessmentWeight: 1.2,
        order: 2,
        color: "#10B981",
        createdBy: adminUser._id,
      },
      {
        name: "Operating Model",
        description: "Modèle opérationnel du projet",
        code: "OPM",
        phase: "All",
        weight: 1.1,
        quickAssessmentWeight: 1.1,
        deepAssessmentWeight: 1.1,
        order: 3,
        color: "#F59E0B",
        createdBy: adminUser._id,
      },
      {
        name: "Gouvernance",
        description: "Gouvernance et pilotage du projet",
        code: "GOV",
        phase: "All",
        weight: 1,
        quickAssessmentWeight: 1,
        deepAssessmentWeight: 1,
        order: 4,
        color: "#EF4444",
        createdBy: adminUser._id,
      },
      {
        name: "Module PM (PMO & Engineering)",
        description: "Gestion de projet et ingénierie",
        code: "PM",
        phase: "All",
        weight: 1.3,
        quickAssessmentWeight: 1.3,
        deepAssessmentWeight: 1.3,
        order: 5,
        color: "#8B5CF6",
        createdBy: adminUser._id,
      },
      {
        name: "Module HSE",
        description: "Hygiène, Sécurité et Environnement",
        code: "HSE",
        phase: "All",
        weight: 1.1,
        quickAssessmentWeight: 1.1,
        deepAssessmentWeight: 1.1,
        order: 6,
        color: "#06B6D4",
        createdBy: adminUser._id,
      },
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log("Categories created:", createdCategories.length);

    // Create Questions for each category
    const questions = [];

    // Générale Questions
    const genCategory = createdCategories.find((c) => c.code === "GEN");
    questions.push(
      {
        text: "Le scope du projet et son découpage sont-ils clairement définis (streams, périmètres fonctionnels) et les interfaces avec d'autres entités (OCP, externes) ont bien été délimitées ?",
        category: genCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non ou flou", value: 1 },
          { text: "Partiellement structuré", value: 2 },
          { text: "Scope détaillé et validé", value: 3 },
        ],
        assessmentType: "quick",
        order: 1,
        createdBy: adminUser._id,
      },
      {
        text: "Disposez-vous d'une charte projet formalisant les objectifs, le concept et le scope, hypothèses... ?",
        category: genCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Aucune", value: 1 },
          { text: "Existe mais incomplète", value: 2 },
          { text: "Charte complète et partagée", value: 3 },
        ],
        assessmentType: "quick",
        order: 2,
        createdBy: adminUser._id,
      },
      {
        text: "La vision du projet (priorité temps / coût / impact) est-elle définie et partagée avec les parties prenantes ? est-elle alignée avec la vision stratégique d'InnoX ?",
        category: genCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Aucune vision formelle", value: 1 },
          { text: "Vision exprimée sans alignement", value: 2 },
          { text: "Vision claire et alignée avec les parties", value: 3 },
        ],
        assessmentType: "quick",
        order: 3,
        createdBy: adminUser._id,
      }
    );

    // Stratégie & Business Model Questions
    const sbmCategory = createdCategories.find((c) => c.code === "SBM");
    questions.push(
      {
        text: "L'offre / produit est-il formalisé pour répondre à un besoin marché identifié ?",
        category: sbmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Flou", value: 1 },
          { text: "Formalisé pour répondre à un besoin clair", value: 2 },
          { text: "Inexistant", value: 3 },
        ],
        assessmentType: "quick",
        order: 4,
        createdBy: adminUser._id,
      },
      {
        text: "Le business model du projet est-il clairement défini et formalisé ?",
        category: sbmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Partiel ou théorique", value: 1 },
          { text: "Document formel, validé", value: 2 },
          { text: "Aucune estimation", value: 3 },
        ],
        assessmentType: "quick",
        order: 5,
        createdBy: adminUser._id,
      },
      {
        text: "Les hypothèses économiques clés (volumes, marges, coûts, pricing) sont-elles connues et validées ?",
        category: sbmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Hypothèses posées sans validation", value: 1 },
          { text: "Hypothèses chiffrées et validées", value: 2 },
          { text: "Non défini", value: 3 },
        ],
        assessmentType: "quick",
        order: 6,
        createdBy: adminUser._id,
      }
    );

    // Operating Model Questions
    const opmCategory = createdCategories.find((c) => c.code === "OPM");
    questions.push(
      {
        text: "Le modèle opérationnel cible est-il défini à court, moyen et long terme (flux, implantations, rôles) ?",
        category: opmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Défini à court terme seulement", value: 1 },
          { text: "Cible claire CMT (court-moyen-long terme)", value: 2 },
          { text: "Non défini", value: 3 },
        ],
        assessmentType: "quick",
        order: 7,
        createdBy: adminUser._id,
      },
      {
        text: "Les objectifs, rôles et KPIs sont-ils définis pour le volet opérations ?",
        category: opmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Aucun objectif", value: 1 },
          { text: "Objectifs partiels", value: 2 },
          { text: "Objectifs, rôles, KPIs définis", value: 3 },
        ],
        assessmentType: "quick",
        order: 8,
        createdBy: adminUser._id,
      }
    );

    // Gouvernance Questions
    const govCategory = createdCategories.find((c) => c.code === "GOV");
    questions.push(
      {
        text: "Une gouvernance projet est-elle formellement mise en place (comitologie, matrice RACI) ?",
        category: govCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non", value: 1 },
          {
            text: "Organisation claire (rôles, comitologie, reporting)",
            value: 2,
          },
          { text: "En place sans rôles définis", value: 3 },
        ],
        assessmentType: "quick",
        order: 9,
        createdBy: adminUser._id,
      },
      {
        text: "Les ressources clés du projet sont-elles identifiées et mobilisées ?",
        category: govCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non", value: 1 },
          { text: "Partiellement affectées", value: 2 },
          { text: "Équipe mobilisée et structurée", value: 3 },
        ],
        assessmentType: "quick",
        order: 10,
        createdBy: adminUser._id,
      },
      {
        text: "Les hypothèses critiques (foncier, utilités, énergie, autorisations) sont-elles sécurisées à date ?",
        category: govCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non sécurisées", value: 1 },
          { text: "Sécurisation partielle", value: 2 },
          { text: "Oui", value: 3 },
        ],
        assessmentType: "quick",
        order: 11,
        createdBy: adminUser._id,
      }
    );

    // Module PM Questions
    const pmCategory = createdCategories.find((c) => c.code === "PM");
    questions.push(
      {
        text: "Des règles de fonctionnement, contrôles et indicateurs de performance (KPIs) ont-ils été définis et fixés ?",
        category: pmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Aucun indicateur", value: 1 },
          { text: "Quelques contrôles existants", value: 2 },
          { text: "Système de pilotage formel et suivi", value: 3 },
        ],
        assessmentType: "quick",
        order: 12,
        createdBy: adminUser._id,
      },
      {
        text: "Un planning global avec jalons clés est-il défini et partagé ?",
        category: pmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Pas de planning", value: 1 },
          { text: "Planning non partagé", value: 2 },
          { text: "Planning global partagé avec jalons clés", value: 3 },
        ],
        assessmentType: "quick",
        order: 13,
        createdBy: adminUser._id,
      },
      {
        text: "Un plan d'exécution projet (PEP) a-t-il été défini à date ?",
        category: pmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non", value: 1 },
          { text: "En cours", value: 2 },
          { text: "Oui validé", value: 3 },
        ],
        assessmentType: "quick",
        order: 14,
        createdBy: adminUser._id,
      },
      {
        text: "Disposez-vous d'un registre de risques structuré et mis à jour ?",
        category: pmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non", value: 1 },
          { text: "En cours", value: 2 },
          { text: "Oui validé", value: 3 },
        ],
        assessmentType: "quick",
        order: 15,
        createdBy: adminUser._id,
      },
      {
        text: "Une liste des livrables (MDR) est-elle formalisée et suivie ?",
        category: pmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non", value: 1 },
          { text: "En cours", value: 2 },
          { text: "Oui validé", value: 3 },
        ],
        assessmentType: "quick",
        order: 16,
        createdBy: adminUser._id,
      },
      {
        text: "Un plan de communication avec les parties prenantes internes et externes est-il défini ?",
        category: pmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non", value: 1 },
          { text: "En cours", value: 2 },
          { text: "Oui validé", value: 3 },
        ],
        assessmentType: "quick",
        order: 17,
        createdBy: adminUser._id,
      },
      {
        text: "Une stratégie contractuelle (EPC, EPMC, PMC) a-t-elle été définie pour la mise en œuvre du projet ?",
        category: pmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non", value: 1 },
          { text: "En cours", value: 2 },
          { text: "Oui validé", value: 3 },
        ],
        assessmentType: "quick",
        order: 18,
        createdBy: adminUser._id,
      },
      {
        text: "Est-ce que vous avez défini un CAPEX et budget de financement ? OPEX, CAPEX, validés ? Instances de prévu ?",
        category: pmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non", value: 1 },
          { text: "En cours", value: 2 },
          { text: "Oui validé", value: 3 },
        ],
        assessmentType: "quick",
        order: 19,
        createdBy: adminUser._id,
      },
      {
        text: "Une roadmap d'Excellence Opérationnelle (ExOp) a-t-elle été définie (digitalisation, performance, organisation) ?",
        category: pmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non", value: 1 },
          { text: "En cours", value: 2 },
          { text: "Oui validé", value: 3 },
        ],
        assessmentType: "quick",
        order: 20,
        createdBy: adminUser._id,
      },
      {
        text: "L'organisation cible (titres, responsabilités, compétences) pour la phase O&M est-elle définie ?",
        category: pmCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non", value: 1 },
          { text: "En cours", value: 2 },
          { text: "Oui validé", value: 3 },
        ],
        assessmentType: "quick",
        order: 21,
        createdBy: adminUser._id,
      }
    );

    // Module HSE Questions
    const hseCategory = createdCategories.find((c) => c.code === "HSE");
    questions.push(
      {
        text: "Avez-vous anticipé la définition d'une roadmap HSE / PSM ?",
        category: hseCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non", value: 1 },
          { text: "En cours", value: 2 },
          { text: "Oui validé", value: 3 },
        ],
        assessmentType: "quick",
        order: 22,
        createdBy: adminUser._id,
      },
      {
        text: "Une organisation HSE dédiée est-elle définie pour les phases construction et exploitation ?",
        category: hseCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non", value: 1 },
          { text: "En cours", value: 2 },
          { text: "Oui validé", value: 3 },
        ],
        assessmentType: "quick",
        order: 23,
        createdBy: adminUser._id,
      },
      {
        text: "Une représentativité HSE est intégrée aux étapes early stage du projet ?",
        category: hseCategory._id,
        type: "multiple-choice",
        options: [
          { text: "Non", value: 1 },
          { text: "En cours", value: 2 },
          { text: "Oui validé", value: 3 },
        ],
        assessmentType: "quick",
        order: 24,
        createdBy: adminUser._id,
      }
    );

    // Insert all questions
    const createdQuestions = await Question.insertMany(questions);
    console.log("Questions created:", createdQuestions.length);

    // Update question counts for categories
    for (const category of createdCategories) {
      await category.updateQuestionCount();
    }

    console.log("Quick Assessment seed completed successfully!");
    console.log("Categories:", createdCategories.length);
    console.log("Questions:", createdQuestions.length);
  } catch (error) {
    console.error("Seed error:", error);
  }
};

module.exports = seedQuickAssessment;

// If running directly
if (require.main === module) {
  const connectDB = require("../config/database");
  connectDB().then(() => {
    seedQuickAssessment()
      .then(() => {
        console.log("Seeding complete");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Seeding failed:", err);
        process.exit(1);
      });
  });
}
