// server/scripts/seedDatabase.js
const mongoose = require('mongoose');
require("dotenv").config({ path: __dirname + "/../.env" });
const connectDB = require('../config/database');
const { Category,Assessment, Question, User } = require('../models');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting full database seeding...');

    // Step 1: Clear existing data
    await Assessment.deleteMany({}); 
    await Question.deleteMany({});
    await Category.deleteMany({});
    console.log('🧹 Cleared existing Questions and Categories.');

    // Step 2: Ensure an Admin User exists
    let adminUser = await User.findOne({ email: 'admin@pmal.com' });
    if (!adminUser) {
      adminUser = await new User({
        firstName: 'Admin',
        lastName: 'Seeder',
        username: 'admin_seeder',
        password: 'DefaultPassword123!',
        email: 'admin@pmal.com',
        userRole: 'Admin',
        isActivated: true,
      }).save();
      console.log('👤 Admin user for seeding was created.');
    } else {
      console.log('👤 Admin user found.');
    }

    // Step 3: Define all unique categories
    const allCategories = new Map();
    const categoryData = [
      { name: "Gouvernance & Pilotage", code: "GOV_D", description: "Gouvernance projet (Deep)", color: "#1e40af", createdBy: adminUser._id },
      { name: "Livrables Structurants", code: "LIV_D", description: "Livrables clés (Deep)", color: "#059669", createdBy: adminUser._id },
      { name: "Méthodologie & Process", code: "MET_D", description: "Méthodologies et processus (Deep)", color: "#dc2626", createdBy: adminUser._id },
      { name: "Outils & Digital", code: "OUT_D", description: "Outils numériques (Deep)", color: "#7c3aed", createdBy: adminUser._id },
      { name: "Risques & Conformité", code: "RIS_D", description: "Gestion des risques (Deep)", color: "#ea580c", createdBy: adminUser._id },
      { name: "Module Spécifique", code: "SPE_D", description: "Questions spécifiques module (Deep)", color: "#0891b2", createdBy: adminUser._id },
      { name: "Générale", code: "GEN_Q", description: "Questions générales (Quick)", color: "#3B82F6", createdBy: adminUser._id },
      { name: "Stratégie & Business Model", code: "SBM_Q", description: "Stratégie et modèle économique (Quick)", color: "#10B981", createdBy: adminUser._id },
      { name: "Operating Model", code: "OPM_Q", description: "Modèle opérationnel (Quick)", color: "#F59E0B", createdBy: adminUser._id },
      { name: "Gouvernance", code: "GOV_Q", description: "Gouvernance projet (Quick)", color: "#EF4444", createdBy: adminUser._id },
      { name: "Module PM (PMO & Engineering)", code: "PM_Q", description: "Gestion de projet et ingénierie (Quick)", color: "#8B5CF6", createdBy: adminUser._id },
      { name: "Module HSE", code: "HSE_Q", description: "Hygiène, Sécurité et Environnement (Quick)", color: "#06B6D4", createdBy: adminUser._id },
    ];
    
    for (const catData of categoryData) {
        const category = await Category.create(catData);
        allCategories.set(catData.code, category);
    }
    console.log(`📁 ${allCategories.size} unique categories created.`);

    // Step 4: Define all questions in a single array
    const allQuestions = [];

    // --- DEEP ASSESSMENT QUESTIONS ---
    allQuestions.push(
      { text: "Une équipe projet est-elle formellement constituée avec des rôles et responsabilités définis ?", category: allCategories.get("GOV_D")._id, type: "multiple-choice", options: [{ text: "Aucune équipe formellement définie", value: 1 },{ text: "Équipe partiellement définie avec quelques rôles", value: 2 },{ text: "Équipe complètement définie avec rôles et responsabilités clairs", value: 3 }], assessmentType: "deep", module: "PM", irlPhase: "IRL1", questionFamily: "Gouvernance_Pilotage", criticality: 3, createdBy: adminUser._id },
      { text: "Les objectifs et le périmètre du projet sont-ils clairement définis et partagés ?", category: allCategories.get("GOV_D")._id, type: "multiple-choice", options: [{ text: "Objectifs flous et non documentés", value: 1 },{ text: "Objectifs partiellement définis", value: 2 },{ text: "Objectifs clairs, documentés et partagés", value: 3 }], assessmentType: "deep", module: "PM", irlPhase: "IRL1", questionFamily: "Gouvernance_Pilotage", criticality: 3, createdBy: adminUser._id },
      { text: "Disposez-vous d'une charte projet formalisée et approuvée ?", category: allCategories.get("LIV_D")._id, type: "multiple-choice", options: [{ text: "Pas de charte projet", value: 1 },{ text: "Charte en cours d'élaboration", value: 2 },{ text: "Charte complète et approuvée", value: 3 }], assessmentType: "deep", module: "PM", irlPhase: "IRL1", questionFamily: "Livrables_Structurants", criticality: 2, createdBy: adminUser._id },
      { text: "Un dossier de définition projet existe-t-il avec les exigences initiales ?", category: allCategories.get("LIV_D")._id, type: "multiple-choice", options: [{ text: "Aucun dossier de définition", value: 1 },{ text: "Dossier partiel ou en cours", value: 2 },{ text: "Dossier complet et validé", value: 3 }], assessmentType: "deep", module: "PM", irlPhase: "IRL1", questionFamily: "Livrables_Structurants", criticality: 2, createdBy: adminUser._id },
      { text: "Une méthodologie de gestion de projet est-elle définie et appliquée ?", category: allCategories.get("MET_D")._id, type: "multiple-choice", options: [{ text: "Aucune méthodologie formelle", value: 1 },{ text: "Méthodologie partiellement définie", value: 2 },{ text: "Méthodologie complète et appliquée", value: 3 }], assessmentType: "deep", module: "PM", irlPhase: "IRL1", questionFamily: "Methodologie_Process", criticality: 2, createdBy: adminUser._id },
      { text: "Des outils de collaboration et de partage d'information sont-ils mis en place ?", category: allCategories.get("OUT_D")._id, type: "multiple-choice", options: [{ text: "Pas d'outils collaboratifs", value: 1 },{ text: "Outils basiques mis en place", value: 2 },{ text: "Outils collaboratifs complets et utilisés", value: 3 }], assessmentType: "deep", module: "PM", irlPhase: "IRL1", questionFamily: "Outils_Digital", criticality: 1, createdBy: adminUser._id },
      { text: "Une identification préliminaire des risques projet a-t-elle été réalisée ?", category: allCategories.get("RIS_D")._id, type: "multiple-choice", options: [{ text: "Aucune identification des risques", value: 1 },{ text: "Identification partielle des risques majeurs", value: 2 },{ text: "Identification systématique et documentation des risques", value: 3 }], assessmentType: "deep", module: "PM", irlPhase: "IRL1", questionFamily: "Risques_Conformite", criticality: 2, createdBy: adminUser._id },
      { text: "Les standards et bonnes pratiques PM sont-ils identifiés pour le projet ?", category: allCategories.get("SPE_D")._id, type: "multiple-choice", options: [{ text: "Aucun standard identifié", value: 1 },{ text: "Standards partiellement identifiés", value: 2 },{ text: "Standards complets identifiés et documentés", value: 3 }], assessmentType: "deep", module: "PM", irlPhase: "IRL1", questionFamily: "Module_Specifique", criticality: 2, createdBy: adminUser._id },
      { text: "Une équipe technique pluridisciplinaire est-elle constituée ?", category: allCategories.get("GOV_D")._id, type: "multiple-choice", options: [{ text: "Pas d'équipe technique définie", value: 1 },{ text: "Équipe partielle avec quelques disciplines", value: 2 },{ text: "Équipe complète pluridisciplinaire", value: 3 }], assessmentType: "deep", module: "Engineering", irlPhase: "IRL1", questionFamily: "Gouvernance_Pilotage", criticality: 3, createdBy: adminUser._id },
      { text: "Les exigences techniques sont-elles formalisées et tracées ?", category: allCategories.get("LIV_D")._id, type: "multiple-choice", options: [{ text: "Pas d'exigences formalisées", value: 1 },{ text: "Exigences partiellement documentées", value: 2 },{ text: "Exigences complètes et tracées", value: 3 }], assessmentType: "deep", module: "Engineering", irlPhase: "IRL1", questionFamily: "Livrables_Structurants", criticality: 3, createdBy: adminUser._id },
      { text: "Un responsable HSE est-il désigné pour le projet ?", category: allCategories.get("GOV_D")._id, type: "multiple-choice", options: [{ text: "Pas de responsable HSE désigné", value: 1 },{ text: "Responsabilité HSE partagée", value: 2 },{ text: "Responsable HSE dédié et formalisé", value: 3 }], assessmentType: "deep", module: "HSE", irlPhase: "IRL1", questionFamily: "Gouvernance_Pilotage", criticality: 3, createdBy: adminUser._id },
      { text: "Une politique HSE projet est-elle définie et communiquée ?", category: allCategories.get("LIV_D")._id, type: "multiple-choice", options: [{ text: "Pas de politique HSE", value: 1 },{ text: "Politique HSE basique", value: 2 },{ text: "Politique HSE complète et communiquée", value: 3 }], assessmentType: "deep", module: "HSE", irlPhase: "IRL1", questionFamily: "Livrables_Structurants", criticality: 3, createdBy: adminUser._id },
      { text: "Les futurs utilisateurs/exploitants sont-ils impliqués dès la conception ?", category: allCategories.get("GOV_D")._id, type: "multiple-choice", options: [{ text: "Pas d'implication des futurs exploitants", value: 1 },{ text: "Consultation ponctuelle", value: 2 },{ text: "Implication active et continue", value: 3 }], assessmentType: "deep", module: "O&M_DOI", irlPhase: "IRL1", questionFamily: "Gouvernance_Pilotage", criticality: 3, createdBy: adminUser._id },
      { text: "Les exigences d'exploitation et de maintenance sont-elles spécifiées ?", category: allCategories.get("LIV_D")._id, type: "multiple-choice", options: [{ text: "Pas d'exigences O&M définies", value: 1 },{ text: "Exigences O&M partielles", value: 2 },{ text: "Exigences O&M complètes et documentées", value: 3 }], assessmentType: "deep", module: "O&M_DOI", irlPhase: "IRL1", questionFamily: "Livrables_Structurants", criticality: 3, createdBy: adminUser._id }
    );

    // --- QUICK ASSESSMENT QUESTIONS ---
    allQuestions.push(
      { text: "Le scope du projet et son découpage sont-ils clairement définis (streams, périmètres fonctionnels) et les interfaces avec d'autres entités (OCP, externes) ont bien été délimitées ?", category: allCategories.get("GEN_Q")._id, type: "multiple-choice", options: [{ text: "Non ou flou", value: 1 },{ text: "Partiellement structuré", value: 2 },{ text: "Scope détaillé et validé", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Disposez-vous d'une charte projet formalisant les objectifs, le concept et le scope, hypothèses... ?", category: allCategories.get("GEN_Q")._id, type: "multiple-choice", options: [{ text: "Aucune", value: 1 },{ text: "Existe mais incomplète", value: 2 },{ text: "Charte complète et partagée", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "La vision du projet (priorité temps / coût / impact) est-elle définie et partagée avec les parties prenantes ? est-elle alignée avec la vision stratégique d'InnoX ?", category: allCategories.get("GEN_Q")._id, type: "multiple-choice", options: [{ text: "Aucune vision formelle", value: 1 },{ text: "Vision exprimée sans alignement", value: 2 },{ text: "Vision claire et alignée avec les parties", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "L'offre / produit est-il formalisé pour répondre à un besoin marché identifié ?", category: allCategories.get("SBM_Q")._id, type: "multiple-choice", options: [{ text: "Flou", value: 1 },{ text: "Formalisé pour répondre à un besoin clair", value: 2 },{ text: "Inexistant", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Le business model du projet est-il clairement défini et formalisé ?", category: allCategories.get("SBM_Q")._id, type: "multiple-choice", options: [{ text: "Partiel ou théorique", value: 1 },{ text: "Document formel, validé", value: 2 },{ text: "Aucune estimation", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Les hypothèses économiques clés (volumes, marges, coûts, pricing) sont-elles connues et validées ?", category: allCategories.get("SBM_Q")._id, type: "multiple-choice", options: [{ text: "Hypothèses posées sans validation", value: 1 },{ text: "Hypothèses chiffrées et validées", value: 2 },{ text: "Non défini", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Le modèle opérationnel cible est-il défini à court, moyen et long terme (flux, implantations, rôles) ?", category: allCategories.get("OPM_Q")._id, type: "multiple-choice", options: [{ text: "Défini à court terme seulement", value: 1 },{ text: "Cible claire CMT (court-moyen-long terme)", value: 2 },{ text: "Non défini", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Les objectifs, rôles et KPIs sont-ils définis pour le volet opérations ?", category: allCategories.get("OPM_Q")._id, type: "multiple-choice", options: [{ text: "Aucun objectif", value: 1 },{ text: "Objectifs partiels", value: 2 },{ text: "Objectifs, rôles, KPIs définis", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Une gouvernance projet est-elle formellement mise en place (comitologie, matrice RACI) ?", category: allCategories.get("GOV_Q")._id, type: "multiple-choice", options: [{ text: "Non", value: 1 },{ text: "Organisation claire (rôles, comitologie, reporting)", value: 2 },{ text: "En place sans rôles définis", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Les ressources clés du projet sont-elles identifiées et mobilisées ?", category: allCategories.get("GOV_Q")._id, type: "multiple-choice", options: [{ text: "Non", value: 1 },{ text: "Partiellement affectées", value: 2 },{ text: "Équipe mobilisée et structurée", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Les hypothèses critiques (foncier, utilités, énergie, autorisations) sont-elles sécurisées à date ?", category: allCategories.get("GOV_Q")._id, type: "multiple-choice", options: [{ text: "Non sécurisées", value: 1 },{ text: "Sécurisation partielle", value: 2 },{ text: "Oui", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Des règles de fonctionnement, contrôles et indicateurs de performance (KPIs) ont-ils été définis et fixés ?", category: allCategories.get("PM_Q")._id, type: "multiple-choice", options: [{ text: "Aucun indicateur", value: 1 },{ text: "Quelques contrôles existants", value: 2 },{ text: "Système de pilotage formel et suivi", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Un planning global avec jalons clés est-il défini et partagé ?", category: allCategories.get("PM_Q")._id, type: "multiple-choice", options: [{ text: "Pas de planning", value: 1 },{ text: "Planning non partagé", value: 2 },{ text: "Planning global partagé avec jalons clés", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Un plan d'exécution projet (PEP) a-t-il été défini à date ?", category: allCategories.get("PM_Q")._id, type: "multiple-choice", options: [{ text: "Non", value: 1 },{ text: "En cours", value: 2 },{ text: "Oui validé", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Disposez-vous d'un registre de risques structuré et mis à jour ?", category: allCategories.get("PM_Q")._id, type: "multiple-choice", options: [{ text: "Non", value: 1 },{ text: "En cours", value: 2 },{ text: "Oui validé", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Une liste des livrables (MDR) est-elle formalisée et suivie ?", category: allCategories.get("PM_Q")._id, type: "multiple-choice", options: [{ text: "Non", value: 1 },{ text: "En cours", value: 2 },{ text: "Oui validé", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Un plan de communication avec les parties prenantes internes et externes est-il défini ?", category: allCategories.get("PM_Q")._id, type: "multiple-choice", options: [{ text: "Non", value: 1 },{ text: "En cours", value: 2 },{ text: "Oui validé", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Une stratégie contractuelle (EPC, EPMC, PMC) a-t-elle été définie pour la mise en œuvre du projet ?", category: allCategories.get("PM_Q")._id, type: "multiple-choice", options: [{ text: "Non", value: 1 },{ text: "En cours", value: 2 },{ text: "Oui validé", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Est-ce que vous avez défini un CAPEX et budget de financement ? OPEX, CAPEX, validés ? Instances de prévu ?", category: allCategories.get("PM_Q")._id, type: "multiple-choice", options: [{ text: "Non", value: 1 },{ text: "En cours", value: 2 },{ text: "Oui validé", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Une roadmap d'Excellence Opérationnelle (ExOp) a-t-elle été définie (digitalisation, performance, organisation) ?", category: allCategories.get("PM_Q")._id, type: "multiple-choice", options: [{ text: "Non", value: 1 },{ text: "En cours", value: 2 },{ text: "Oui validé", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "L'organisation cible (titres, responsabilités, compétences) pour la phase O&M est-elle définie ?", category: allCategories.get("PM_Q")._id, type: "multiple-choice", options: [{ text: "Non", value: 1 },{ text: "En cours", value: 2 },{ text: "Oui validé", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Avez-vous anticipé la définition d'une roadmap HSE / PSM ?", category: allCategories.get("HSE_Q")._id, type: "multiple-choice", options: [{ text: "Non", value: 1 },{ text: "En cours", value: 2 },{ text: "Oui validé", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Une organisation HSE dédiée est-elle définie pour les phases construction et exploitation ?", category: allCategories.get("HSE_Q")._id, type: "multiple-choice", options: [{ text: "Non", value: 1 },{ text: "En cours", value: 2 },{ text: "Oui validé", value: 3 }], assessmentType: "quick", createdBy: adminUser._id },
      { text: "Une représentativité HSE est intégrée aux étapes early stage du projet ?", category: allCategories.get("HSE_Q")._id, type: "multiple-choice", options: [{ text: "Non", value: 1 },{ text: "En cours", value: 2 },{ text: "Oui validé", value: 3 }], assessmentType: "quick", createdBy: adminUser._id }
    );

    // Step 5: Insert all questions into the database
    await Question.insertMany(allQuestions);
    console.log(`❓ ${allQuestions.length} total questions created.`);

    console.log("\n🎉 Full database seeding completed successfully!");

  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected.');
  }
};

seedDatabase();