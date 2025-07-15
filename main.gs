/**
 * @OnlyCurrentDoc
 */

// Dimension Definitions
const DIMENSION_Z = {
  0: "standard limited company",
  1: "employee owned company",
  2: "single stakeholder cooperative",
  3: "Multiple stakeholder cooperative",
  4: "FairShares company",
  5: "Agentic company"
};

const DIMENSION_Y = {
  0: "Micro-management",
  1: "Delegated authority",
  2: "Self-managing",
  3: "Self-governing",
  4: "Self-directing",
  5: "Autopoietic"
};

const DIMENSION_X = {
  0: "Replaceable human tools",
  1: "People as sets of skills",
  2: "Psychologically safe",
  3: "Common developmental practices",
  4: "Development is systemic",
  5: "Development as a purpose"
};

const AGENCY_NAME = [
  "No agency",
  "Very restricted agency",
  "Limited agency",
  "Some agency",
  "Good agency",
  "Full agency"
];

function onFormSubmit(e) {
  const itemResponses = e.response.getItemResponses();
  const response = {};
  itemResponses.forEach(itemResponse => {
    response[itemResponse.getItem().getTitle()] = itemResponse.getResponse();
  });
  response['email'] = e.response.getRespondentEmail();

  const analysis = analyzeResponse(response);
  const email = generateEmail(analysis, response);
  sendEmail(email, response['email']);
}

function analyzeResponse(response) {
  // Constants from form responses
  const R_first_name = response["Please enter your first / given name"];
  const R_last_name = response["Please enter your last / family name"];
  const R_company_name = response["Your company's name"];
  const R_role = response["Please enter your role"];
  const R_business_intent = response["Your overarching business intent is (tick the most dominant one):"];
  const R_sector = response["What industry/sector are you operating in?"];
  const R_exit_strategy = response["Your overarching business intent is (tick the most dominant one):"];

  // Flags
  const R_incorporated_flag = response["I'm answering these questions according to how the company"] === "is already incorporated";
  const R_DAO_flag = response["Are you using a DAO?"] !== "No";
  const DAO_form = R_DAO_flag ? "DAO/Incorporation" : "incorporation";

  // Running totals
  let Y_running_total = 0;
  let X_running_total = 0;
  let Z_level_scores = [0, 0, 0, 0, 0, 0];

  // Detailed health check question
  const healthCheckQuestion = "Do you want to go on to the more detailed health check of the actual strength of your incorporation? If you want to end here, at the self-assessment, choose no.";
  const healthCheckResponse = response[healthCheckQuestion];
  const R_only_self_assessment_flag = healthCheckResponse === "No, I want only the self-assessment";

  if (R_only_self_assessment_flag) {
    return { R_only_self_assessment_flag };
  }

  // Work and human structures question
  const workHumanQuestion = "Do you want to also assess how fit for purpose your work and human structures and interactions are? If you want to end here, and only assess your incorporation, choose no.";
  const workHumanResponse = response[workHumanQuestion];
  const R_only_incorporation_flag = workHumanResponse === "No, I want to focus only on incorporation";

  Z_level_scores = processDimensionZ(response, Z_level_scores);

  if (R_only_incorporation_flag) {
    return { R_only_incorporation_flag, Z_level_scores };
  }

  // Process other dimensions if needed
  const yData = processDimensionY(response, Y_running_total);
  const xData = processDimensionX(response, X_running_total);

  return {
    R_first_name,
    R_last_name,
    R_company_name,
    R_role,
    R_business_intent,
    R_sector,
    R_exit_strategy,
    R_incorporated_flag,
    R_DAO_flag,
    DAO_form,
    Y_running_total: yData.Y_running_total,
    Y_self_assessment_text: yData.Y_self_assessment_text,
    Y_self_assessment_level: yData.Y_self_assessment_level,
    Y_scored_level: yData.Y_scored_level,
    X_running_total: xData.X_running_total,
    X_self_assessment_text: xData.X_self_assessment_text,
    X_self_assessment_level: xData.X_self_assessment_level,
    X_scored_level: xData.X_scored_level,
    Z_level_scores,
    R_first_name,
    R_last_name,
    R_company_name,
    R_role,
    R_business_intent,
    R_sector,
    R_exit_strategy,
    R_incorporated_flag,
    R_DAO_flag,
    DAO_form,
    Y_running_total,
    X_running_total,
    Z_level_scores
  };
}

function processDimensionZ(response, Z_level_scores) {
  // Dimension Z self-assessment
  const zQuestion = "If already incorporated, the company's incorporation form is a (choose the closest legal form in your jurisdiction). If not yet incorporated, choose the one you currently intend to use.";
  const zResponse = response[zQuestion];
  let Z_self_assessment = zResponse;
  let Z_self_assessment_level = 0;
  let Z_self_assessment_text = "";

  if (zResponse === "Other") {
    Z_self_assessment_text = response[zQuestion + " (Other)"];
    Z_self_assessment_level = -1;
  } else {
    // This is a simplified mapping. You may need to adjust the levels based on your specific needs.
    const zLevelMapping = {
      "A private limited company.": 0,
      "A public limited company.": 0,
      "An Employee Owned Trust or equivalent.": 1,
      "A single stakeholder cooperative.": 2,
      "A multistakeholder cooperative, where voting rights are equitably split across multiple classes of members, e.g. a Somerset Rules cooperative.": 3,
      "A steward-owned company.": 4,
      "A public benefit company.": 4,
      "A perpetual purpose trust.": 4,
      "A Community Interest Company.": 4,
      "A FairShares company.": 4,
      "A FairShares Commons company.": 4,
      "A foundation / charity.": 4,
    };
    Z_self_assessment_level = zLevelMapping[zResponse] !== undefined ? zLevelMapping[zResponse] : -1;
  }

  // Voting rights question
  const votingQuestion = "Is buying shares all that’s needed to get voting rights? (Voting rights come automatically with financial investment.)";
  const votingResponse = response[votingQuestion];
  if (votingResponse === "Yes") {
    Z_level_scores[0] += 1;
  } else if (votingResponse === "No, there are additional criteria beyond financial investment to qualify to vote") {
    Z_level_scores[1] += 1;
    Z_level_scores[2] += 1;
    Z_level_scores[3] += 1;
    Z_level_scores[4] += 1;
    Z_level_scores[5] += 1;
  }

  // Shareholders as owners question
  const ownersQuestion = "Are shareholders (e.g.: investors, founders, stewards, customers, staff etc. according to the company shareholder structure) regarded as the owners of the company?";
  const ownersResponse = response[ownersQuestion];
  if (ownersResponse === "Yes") {
    Z_level_scores[0] += 1;
    Z_level_scores[1] += 1;
    Z_level_scores[2] += 1;
    Z_level_scores[3] += 1;
    Z_level_scores[4] += 1;
  } else if (ownersResponse === "No") {
    Z_level_scores[5] += 10;
  }

  // Staff financial benefits question
  const financialBenefitsQuestion = "How are staff included in the financial benefits of shareholding, so that they have a share of dividends and any growth in the company's value. (Tick all that apply.)";
  const financialBenefitsResponse = response[financialBenefitsQuestion];
  if (financialBenefitsResponse) {
    financialBenefitsResponse.forEach(option => {
      switch (option) {
        case "Only if staff buy or sell shares; they're included because they have invested, not because they are staff; there's no difference":
          Z_level_scores[0] += 1;
          break;
        case "Staff benefit from a reduced share price, employee stock ownership plan (ESOP) or similar":
          Z_level_scores[1] += 1;
          Z_level_scores[2] += 1;
          Z_level_scores[3] += 1;
          break;
        case "A percentage, but less than 50%, of the shares are reserved for, and can only be owned by staff. (i.e., staff can only sell them to other staff members.)":
          Z_level_scores[1] += 1;
          break;
        case "Over 50%, but less than 100%, of the shares are reserved for, and can only be owned by staff. (i.e., staff can only sell them to other staff members.)":
          Z_level_scores[1] += 2;
          Z_level_scores[2] += 1;
          break;
        case "All of the shares are reserved for, and can only be owned by staff. (i.e., staff can only sell them to other staff members.)":
          Z_level_scores[1] += 2;
          Z_level_scores[2] += 2;
          break;
        case "Qualifies legally as an employee owned company, e.g. because staff shares are held in an employee ownership trust with at least 51% of the shares":
          Z_level_scores[1] += 10;
          break;
        case "There is a robust protection (e.g. a special share class) protecting the staff wealth share rights":
          Z_level_scores[2] += 1;
          Z_level_scores[3] += 1;
          Z_level_scores[4] += 1;
          Z_level_scores[5] += 1;
          break;
        case "Staff are receive a fair share of profit and / or company value growth via a mechanism based on their work contribution, independent of their financial investment":
          Z_level_scores[4] += 5;
          Z_level_scores[5] += 5;
          break;
      }
    });
  }

  // Staff governance question
  const staffGovernanceQuestion = "How are staff included in the governance aspect of shareholding - the staff share of governance / voting rights. Check all that apply.";
  const staffGovernanceResponse = response[staffGovernanceQuestion];
  if (staffGovernanceResponse) {
    staffGovernanceResponse.forEach(option => {
      switch (option) {
        case "Staff only get voting rights when they buy voting shares just as any investor does":
          Z_level_scores[0] += 5;
          break;
        case "Between 10% and 50% of the voting rights are reserved for staff, can only be exercised by staff, and cannot be sold to non-staff":
          Z_level_scores[1] += 1;
          Z_level_scores[3] += 1;
          Z_level_scores[4] += 1;
          Z_level_scores[5] += 1;
          break;
        case "Over 50% of the voting rights are reserved for staff, can only be exercised by staff, and cannot be sold to non-staff":
          Z_level_scores[1] += 1;
          Z_level_scores[2] += 1;
          Z_level_scores[3] += 1;
          Z_level_scores[4] += 1;
          Z_level_scores[5] += 1;
          break;
        case "All (100%) of the voting rights are reserved for staff, can only be exercised by staff, and cannot be sold to non-staff":
          Z_level_scores[1] += 1;
          Z_level_scores[2] += 1;
          break;
        case "The company qualifies legally as an employee owned company, or there is some robust protection protecting the staff governance rights":
          Z_level_scores[1] += 1;
          Z_level_scores[2] += 1;
          Z_level_scores[3] += 1;
          Z_level_scores[4] += 1;
          Z_level_scores[5] += 1;
          break;
      }
    });
  }

  // Democratic governance question
  const democraticGovernanceQuestion = "Democratic Governance: your incorporation legally underpins the democratic governance by all its members (e.g. customers, workers) independent of how much was invested.";
  const democraticGovernanceResponse = response[democraticGovernanceQuestion];
  if (democraticGovernanceResponse === "Yes, and members have equal voting power (e.g. one member, one vote, no weighting)") {
    Z_level_scores[2] += 1;
    Z_level_scores[3] += 1;
  } else if (democraticGovernanceResponse === "Yes, and members have unequal voting rights (e.g. one member, one vote but weighted in different stakeholder blocks)") {
    Z_level_scores[3] += 1;
    Z_level_scores[4] += 1;
    Z_level_scores[5] += 1;
  } else if (democraticGovernanceResponse === "No") {
    Z_level_scores[0] += 1;
    Z_level_scores[1] += 1;
  }

  // Autonomy and independence question
  const autonomyQuestion = "Autonomy and Independence: your incorporation legally underpins it as an autonomous organisation governed by its members (e.g. workers, customers, community) to best enable it to fulfill its purpose. They are encouraged / expected to govern as stewards / in loco parentis on its behalf.";
  const autonomyResponse = response[autonomyQuestion];
  if (autonomyResponse === "Yes") {
    Z_level_scores[3] += 1;
    Z_level_scores[4] += 1;
    Z_level_scores[5] += 1;
  } else if (autonomyResponse === "No") {
    Z_level_scores[0] += 1;
    Z_level_scores[1] += 1;
    Z_level_scores[2] += 1;
    Z_level_scores[3] -= 1;
    Z_level_scores[4] -= 1;
    Z_level_scores[5] -= 10;
  }

  // Qualifying criteria question
  const criteriaQuestion = "There are qualifying criteria (beyond simply buying a share) that members (shareholders) of the company must satisfy to become members.";
  const criteriaResponse = response[criteriaQuestion];
  if (criteriaResponse === "Yes") {
    Z_level_scores[1] += 1;
    Z_level_scores[2] += 1;
    Z_level_scores[3] += 1;
    Z_level_scores[4] += 1;
    Z_level_scores[5] += 1;
  } else if (criteriaResponse === "No") {
    Z_level_scores[0] += 10;
  }

  // Multiple classes of members question
  const multiClassQuestion = "There are multiple classes of members / shareholders with distinct qualifying criteria, rights and obligations. If yes, tick all that apply. For example, you have classes for stewards and/or founders, staff, customers, suppliers, voting investors, non-voting investors. (Tick all that apply).";
  const multiClassResponse = response[multiClassQuestion];
  if (multiClassResponse) {
    multiClassResponse.forEach(option => {
      switch (option) {
        case "No":
          Z_level_scores[0] += 1;
          Z_level_scores[1] += 1;
          Z_level_scores[2] += 1;
          break;
        case "Yes, there are different classes, with distinct qualifying criteria independent of financial investment for all but the (perhaps non-voting) investor shares":
          Z_level_scores[0] -= 1;
          Z_level_scores[1] += 1;
          Z_level_scores[2] -= 1;
          Z_level_scores[3] += 1;
          Z_level_scores[4] += 1;
          Z_level_scores[5] += 1;
          break;
        case "Yes, and voting power is fairly shared across all, weighted across the different classes so that no single class can dominate over the others":
          Z_level_scores[3] += 1;
          Z_level_scores[4] += 1;
          Z_level_scores[5] += 1;
          break;
        case "Yes, and multiple classes have a fair share of any profit / operating surplus":
          Z_level_scores[3] += 1;
          Z_level_scores[4] += 1;
          Z_level_scores[5] += 1;
          break;
        case "Yes, and each class has a fair share of any increase in the company value":
          Z_level_scores[4] += 4;
          Z_level_scores[5] += 4;
          break;
        case "Yes, and only the investor class shares are tradable, all other classes are non-tradable and withdrawn whenever the member ceases to satisfy the qualifying criteria for the class":
          Z_level_scores[3] += 2;
          Z_level_scores[4] += 5;
          Z_level_scores[5] += 5;
          break;
      }
    });
  }

  // Purpose question
  const purposeQuestion = "Does the company have a purpose, beyond e.g. maximising total shareholder return; and this purpose is explicitly written into the articles of incorporation or equivalent legal document legally binding for both operating and shareholder decisions; and with a significant / super majority threshold to change.";
  const purposeResponse = response[purposeQuestion];
  if (purposeResponse === "The company legally anchors itself in a purpose statement, written into the incorporation documentation and binding on governance and operations; or,") {
    Z_level_scores[2] += 1;
    Z_level_scores[3] += 1;
    Z_level_scores[4] += 1;
    Z_level_scores[5] += 1;
  } else if (purposeResponse === "The company legally anchors itself even deeper than purpose, in a driver statement, the external context and need, from which the purpose is visibly derived") {
    Z_level_scores[5] += 5;
  } else if (purposeResponse === "Neither, the company has no explicit legally binding purpose") {
    Z_level_scores[0] += 5;
    Z_level_scores[1] += 1;
    Z_level_scores[3] -= 1;
    Z_level_scores[4] -= 1;
    Z_level_scores[5] -= 5;
  }

  // Stewardship question
  const stewardshipQuestion = "Stewardship rights, obligations, and role in governance (tick all that apply) Check all that apply.";
  const stewardshipResponse = response[stewardshipQuestion];
  if (stewardshipResponse) {
    stewardshipResponse.forEach(option => {
      switch (option) {
        case "No stewards exist in any voting role in the company":
          Z_level_scores[0] += 1;
          Z_level_scores[1] += 1;
          Z_level_scores[2] += 1;
          Z_level_scores[5] -= 10;
          break;
        case "The company has stewards, but they have less voting weight than the largest voting block, or do not have veto power":
          Z_level_scores[0] -= 5;
          Z_level_scores[3] += 1;
          Z_level_scores[4] += 1;
          break;
        case "Stewards are required to vote according to legally binding principles of stewardship":
          Z_level_scores[3] += 1;
          Z_level_scores[5] += 1;
          break;
        case "Stewards represent nature as a whole in governance, and at least one has expertise in that":
          Z_level_scores[5] += 1;
          break;
        case "Stewards represent future generations as a whole in governance, and at least one has expertise in that":
          Z_level_scores[5] += 1;
          break;
        case "Stewards represent the essence, integrity, etc. of the company as an independent entity to any and all stakeholders, and at least one has expertise in that":
          Z_level_scores[3] += 1;
          Z_level_scores[5] += 1;
          break;
        case "Stewards have veto power if any shareholder proposal risks irrevocably breaking one of the principles of stewardship":
          Z_level_scores[3] += 1;
          Z_level_scores[5] += 1;
          break;
      }
    });
  }

  // Legal personhood question
  const personhoodQuestion = "How well does your company make explicit and express in practice that its legal personhood means that it is legally a free person, not property, not an ownable thing, and especially that it is not owned by the shareholders?";
  const personhoodResponse = response[personhoodQuestion];
  switch (personhoodResponse) {
    case "1  Not at all, the company is seen as owned.":
      Z_level_scores[0] += 1;
      Z_level_scores[1] += 1;
      Z_level_scores[2] += 1;
      Z_level_scores[3] += 1;
      Z_level_scores[5] -= 5;
      break;
    case "2":
      Z_level_scores[0] += 1;
      Z_level_scores[1] += 1;
      Z_level_scores[2] += 1;
      Z_level_scores[3] += 1;
      Z_level_scores[5] -= 3;
      break;
    case "3":
      Z_level_scores[5] -= 1;
      break;
    case "4":
      Z_level_scores[0] -= 5;
      Z_level_scores[3] += 1;
      Z_level_scores[4] += 1;
      Z_level_scores[5] += 1;
      break;
    case "5   It is explicit, known to all, and enabled by a fair share of governance and veto rights across stewards and multiple member classes.":
      Z_level_scores[0] -= 5;
      Z_level_scores[1] -= 1;
      Z_level_scores[4] += 1;
      Z_level_scores[5] += 5;
      break;
  }

  // Preventing sale question
  const saleQuestion = "Do the company statutes and governance prevent the company from being bought or sold even if the investors; or the staff / customers in a cooperative; or some other subset of stakeholders decides to?";
  const saleResponse = response[saleQuestion];
  if (saleResponse === "Yes, there are mechanisms to prevent the company being sold") {
    Z_level_scores[0] -= 5;
    Z_level_scores[2] += 1;
    Z_level_scores[3] += 1;
    Z_level_scores[4] += 1;
    Z_level_scores[5] += 1;
  } else if (saleResponse === "No") {
    Z_level_scores[0] += 5;
    Z_level_scores[1] += 1;
  }

  // Multicapital governance question
  const multicapitalGovernanceQuestion = "Multicapital governance: is each capital (e.g. the six capitals defined by the Integrated Reporting Framework) that the company directly depends on or impacts (beyond negligible or tangential impact) represented in governance by stakeholders and / or stewards, with the power and the mandate to hold the company to account for outcomes, and an equitable share of power?";
  const multicapitalGovernanceResponse = response[multicapitalGovernanceQuestion];
  if (multicapitalGovernanceResponse === "Yes, multiple capitals are represented in governance with a fair share of power") {
    Z_level_scores[3] += 1;
    Z_level_scores[4] += 1;
    Z_level_scores[5] += 1;
  } else if (multicapitalGovernanceResponse === "No") {
    Z_level_scores[4] -= 5;
    Z_level_scores[5] -= 5;
  }

  // Multicapital reward question
  const multicapitalRewardQuestion = "Multicapital reward: is each capital (e.g. the six capitals defined by the Integrated Reporting Framework) that is invested entitled to receive a fair share of any financial growth (e.g. a fair share of dividends and capital growth)? Perhaps via representing stakeholders, and where these have the power and the mandate to hold the company to account for maintaining a fair share?";
  const multicapitalRewardResponse = response[multicapitalRewardQuestion];
  if (multicapitalRewardResponse === "Profit: Yes, all get a fair share of profit generated") {
    Z_level_scores[4] += 1;
    Z_level_scores[5] += 1;
  } else if (multicapitalRewardResponse === "Company value: Yes, all get a fair share of gain in the company value") {
    Z_level_scores[4] += 1;
    Z_level_scores[5] += 1;
  } else if (multicapitalRewardResponse === "Both: Yes, all get a fair share of both profit / surplus and gain in the company value") {
    Z_level_scores[4] += 5;
    Z_level_scores[5] += 5;
  } else if (multicapitalRewardResponse === "No") {
    Z_level_scores[4] -= 5;
    Z_level_scores[5] -= 5;
  }

  // Rebalancing question
  const rebalancingQuestion = "Does the company regularly, on an ongoing basis for perpetuity, (e.g. annually) rebalance shareholding | equity | tokens to reflect contributions / investments of non-financial capitals (e.g. time, intellectual, relationship, etc.) by staff and / or other stakeholders -- especially unremunerated.";
  const rebalancingResponse = response[rebalancingQuestion];
  if (rebalancingResponse === "Yes") {
    Z_level_scores[4] += 5;
    Z_level_scores[5] += 5;
  } else if (rebalancingResponse === "No") {
    Z_level_scores[4] -= 5;
    Z_level_scores[5] -= 5;
  }

  // Cooperation question
  const cooperationQuestion = "How well do the company's articles of incorporation and operating structures and structured interactions enable tangible cooperation with other companies, even those with competing businesses?";
  const cooperationResponse = response[cooperationQuestion];
  switch (cooperationResponse) {
    case "1":
      Z_level_scores[0] += 1;
      Z_level_scores[1] += 1;
      break;
    case "2":
      Z_level_scores[0] += 1;
      Z_level_scores[1] += 1;
      Z_level_scores[2] += 1;
      Z_level_scores[3] += 1;
      break;
    case "3":
      Z_level_scores[2] += 1;
      Z_level_scores[3] += 1;
      Z_level_scores[4] += 1;
      break;
    case "4":
      Z_level_scores[4] += 1;
      Z_level_scores[5] += 1;
      break;
    case "5":
      Z_level_scores[4] += 2;
      Z_level_scores[5] += 2;
      break;
  }

  // Living being question
  const livingBeingQuestion = "How effectively is the company seen as, and constructed to enable it to function as, a living being -- i.e., a collective living system with collective intelligence, culture (collective beliefs) composed of human beings as the individual cells.";
  const livingBeingResponse = response[livingBeingQuestion];
  switch (livingBeingResponse) {
    case "1":
      Z_level_scores[0] += 1;
      Z_level_scores[1] += 1;
      Z_level_scores[4] -= 1;
      Z_level_scores[5] -= 1;
      break;
    case "2":
      Z_level_scores[0] += 1;
      Z_level_scores[1] += 1;
      Z_level_scores[2] += 1;
      Z_level_scores[4] -= 1;
      Z_level_scores[5] -= 1;
      break;
    case "3":
      Z_level_scores[2] += 1;
      Z_level_scores[3] += 1;
      break;
    case "4":
      Z_level_scores[4] += 1;
      Z_level_scores[5] += 1;
      break;
    case "5":
      Z_level_scores[4] += 1;
      Z_level_scores[5] += 1;
      break;
  }

  // Financial capital purpose question
  const financialCapitalQuestion = "How explicitly clear is it in the company's structures and governance that the purpose of financial capital is to serve life?";
  const financialCapitalResponse = response[financialCapitalQuestion];
  switch (financialCapitalResponse) {
    case "1":
      Z_level_scores[0] += 2;
      break;
    case "2":
      Z_level_scores[1] += 1;
      break;
    case "3":
      Z_level_scores[1] += 1;
      Z_level_scores[2] += 1;
      Z_level_scores[3] += 1;
      break;
    case "4":
      Z_level_scores[2] += 1;
      Z_level_scores[3] += 1;
      Z_level_scores[4] += 1;
      Z_level_scores[5] += 1;
      break;
    case "5":
      Z_level_scores[4] += 1;
      Z_level_scores[5] += 1;
      break;
  }
  return Z_level_scores;
}

function processDimensionY(response, Y_running_total) {
  const yQuestion = "What kind of organisation design do you have? Choose the one that most closely describes what is happening in practice, not what may be written down.";
  const yResponse = response[yQuestion];
  let Y_self_assessment_text = "";
  let Y_self_assessment_level = 0;

  switch (yResponse) {
    case "Hierarchy of roles with micro-management, each with a job description and title, senior roles closely manage the work of their direct reports; you rise in the hierarchy through promotion.":
      Y_self_assessment_text = "Traditional hierarchy, significant micro-management";
      Y_self_assessment_level = 0;
      break;
    case "Hierarchy of roles with delegation, each with a job description and title, senior roles define top level objectives and goals, then delegate accountability for how to deliver them to their direct reports; you rise in the hierarchy through promotion.":
      Y_self_assessment_text = "Hierarchy, significant delegation";
      Y_self_assessment_level = 1;
      break;
    case "We pretend to have a flat organisation, but there's a hidden hierarchy in practice.":
      Y_self_assessment_text = "Hidden hierarchy";
      Y_self_assessment_level = 1;
      break;
    case "Self-Managing, individuals have significant accountability for managing their own work, turning to line managers or similar when needed.":
      Y_self_assessment_text = "Self-managing";
      Y_self_assessment_level = 2;
      break;
    case "Self-Governing: individuals energise roles with high independent accountability, including the ability to change the role definition without approval from above (albeit with consent from other roles impacted by the proposed change).":
      Y_self_assessment_text = "Self-Governing";
      Y_self_assessment_level = 3;
      break;
    case "Self-Directing: in addition to the above, individuals have significant autonomy in defining the objectives, goals, KPIs of their roles and areas of the business.":
      Y_self_assessment_text = "Self-Directing";
      Y_self_assessment_level = 4;
      break;
    case "Autopoietic: in addition to the above, there are structures and processes in place enabling staff (rather than only investors) to recognise and turn to action when it's time for the organisation to cease to exist, to create spin-offs / offspring, to merge with another organisation":
      Y_self_assessment_text = "Autopoietic";
      Y_self_assessment_level = 5;
      break;
    case "Other":
      Y_self_assessment_text = response[yQuestion + " (Other)"];
      Y_self_assessment_level = -1;
      break;
  }

  const questionMap = {
    "There are systems in place that encourage and support the orientation of all members of the organization along the strategic imperatives.": [-10, -5, 0, 5, 10],
    "What is the relationship between managers and those below them with expertise?": [-10, -5, 0, 5, 10],
    "Who sets goals and how to achieve them?": [-10, -5, 0, 5, 10],
    "Y3: Who has authority to define and change job / role descriptions including accountabilities?": [-10, -5, 0, 5, 10],
    "Y4: Decisions broader than within one role's accountability are made beyond simple hierarchy and beyond simple majority vote (e.g., via a consent principle).": [-10, -5, 0, 5, 10],
    "Y5: Systems are implemented that support the self-management of teams and roles.": [-10, -5, 0, 5, 10],
    "Y6: There are ways all members of the organization can instigate change processes leading to modified or new objectives / goals / purposes for the organisation as a whole, e.g. when frontline staff recognise that the business context has changed, and hence the company ought to consider a new direction (with input and consent needed only from roles / jobs affected by the proposed change, but not necessarily \"management\")": [-10, -5, 0, 5, 10],
    "Y7: Who decides on who joins or leaves a team?": [-10, -5, 0, 5, 10],
    "Y8: What is the primary role of senior management / leaders?": [-10, -5, 0, 5, 10],
    "Y9: What is the relative importance of the organisation’s survival vs. the purpose of the organisation?": [-10, -5, 0, 5, 10],
    "Y10: External stakeholder interfaces are fluid and permeable – stakeholders are seen as part of the system, co-creative, co-directing, actively contributing to the organisation meeting the broad external needs and context.": [-10, -5, 0, 5, 10]
  };

  for (const question in questionMap) {
    const responseValue = response[question];
    if (responseValue) {
      const scoreIndex = parseInt(responseValue.split(" ")[0]) - 1;
      if (!isNaN(scoreIndex) && scoreIndex >= 0 && scoreIndex < questionMap[question].length) {
        Y_running_total += questionMap[question][scoreIndex];
      }
    }
  }

  let Y_scored_level = 0;
  if (Y_running_total < -80) {
    Y_scored_level = 0;
  } else if (Y_running_total >= -79 && Y_running_total < -30) {
    Y_scored_level = 1;
  } else if (Y_running_total >= -29 && Y_running_total < 20) {
    Y_scored_level = 2;
  } else if (Y_running_total >= 21 && Y_running_total < 70) {
    Y_scored_level = 3;
  } else if (Y_running_total >= 71 && Y_running_total < 100) {
    Y_scored_level = 4;
  } else if (Y_running_total >= 101) {
    Y_scored_level = 5;
  }

  return { Y_running_total, Y_self_assessment_text, Y_self_assessment_level, Y_scored_level };
}

function generateEmail(analysis, response) {
  const R_company_name = analysis.R_company_name;
  const subject = `Results: how strong the foundations are of ${R_company_name}`;

  if (analysis.R_only_self_assessment_flag) {
    return generateSelfAssessmentEmail(subject);
  }

  if (analysis.R_only_incorporation_flag) {
    return generateIncorporationOnlyEmail(analysis, subject);
  }

  const {
    R_first_name,
    R_business_intent,
    DAO_form,
    Z_level_scores,
    Y_scored_level,
    X_scored_level,
    Z_self_assessment_level,
    Y_self_assessment_level,
    X_self_assessment_level,
    R_DAO_flag,
    Y_self_assessment_text,
    X_self_assessment_text
  } = analysis;

  const Z_scored_level = Z_level_scores.indexOf(Math.max(...Z_level_scores));

  let body = `<p>Hi ${R_first_name},</p>`;
  body += `<p>Here is the first level evaluation of whether your foundations are strong enough to support your ${R_business_intent} business intention for your company ${R_company_name}. You can get a more thorough evaluation by <a href="https://www.evolutesix.com/legal-od-strong-enough">buying an initial consulting session</a> with us.</p>`;

  body += "<p>So, how strong are your foundations, on a scale from 0 (no agency) to 5 (full agency) in each dimension? To build a truly viable future economy only full agency in all three dimensions is strong enough. Scoring 0 to 2 is inadequate, scoring 3 is marginal, scoring 4 is good, and scoring 5 is excellent! Of course even a score of 3 puts you in the top 1% vs. all other companies. So with 4 or 5 you really are pushing against the limits of today’s beliefs.</p>";
  body += "<ul>";
  if (!analysis.R_only_self_assessment_flag) {
    body += `<li>For the ${DAO_form} dimension your score is: ${Z_scored_level} ${AGENCY_NAME[Z_scored_level]}.</li>`;
    if (!analysis.R_only_incorporation_flag) {
      body += `<li>For the work / organisation design dimension your score is: ${Y_scored_level} ${AGENCY_NAME[Y_scored_level]}.</li>`;
      body += `<li>For the human dimension your score is: ${X_scored_level} ${AGENCY_NAME[X_scored_level]}.</li>`;
    } else {
      body += "<li>Because you only did the self-assessment for the work and human dimensions, here is the strength according to that. If you want a comparison between your actual strength and your perception, please edit the form and fill in the remaining dimensions.</li>";
      body += `<li>For the work / organisation design dimension your self-assessment is: ${Y_self_assessment_level} ${AGENCY_NAME[Y_self_assessment_level]}.</li>`;
      body += `<li>For the human dimension your self-assessment is: ${X_self_assessment_level} ${AGENCY_NAME[X_self_assessment_level]}.</li>`;
    }
  } else {
    body += `<li>For the ${DAO_form} dimension your self-assessment is: ${Z_self_assessment_level} ${AGENCY_NAME[Z_self_assessment_level]}.</li>`;
    body += `<li>For the work / organisation design dimension your self-assessment is: ${Y_self_assessment_level} ${AGENCY_NAME[Y_self_assessment_level]}.</li>`;
    body += `<li>For the human dimension your self-assessment is: ${X_self_assessment_level} ${AGENCY_NAME[X_self_assessment_level]}.</li>`;
  }
  body += "</ul>";

  if (R_DAO_flag) {
    body += "<p>Since you’re using a DAO, this automated questionnaire will give you good directional guidance on whether the strength of your foundations is enough for your intent, but to get more you need the dialogue of the next stage, a consulting session.</p>";
    const daoResponse = response["Are you using a DAO?"];
    if (daoResponse === "Yes, a pure DAO. If so, choose the answer for the remaining questions on incorporation that best reflects your DAO's structure and governance.") {
      body += "<p>Because you’re using a pure DAO without legal personhood, the key question we ought to begin with is the potential liability of your members. For example, in the class action law suit against bZx DAO, the court found that the DAO was an unincorporated association, and as such the members could be held severally and jointly liable.</p>";
    } else if (daoResponse === "Yes, and it is in a jurisdiction that recognises my DAO as a legal person, i.e., as incorporated. If so, choose the answer for the remaining questions on incorporation that best reflects the whole.") {
      body += "<p>Well done using an incorporated DAO form, that gives you a stronger foundation than a pure unincorporated DAO.</p>";
    } else if (daoResponse === "Yes, and I have wrapped the DAO in a legal entity. If so, choose the answer for the remaining questions on incorporation that best reflects the whole.") {
      body += "<p>Well done using a DAO wrapped in an incorporated legal entity, that gives you a stronger foundation than a pure unincorporated DAO. One key question to address in a consulting session is the alignment of the DAO and legal entity governance, especially any gaps.</p>";
    }
  }

  body += `<p>Given your business intention is ${R_business_intent},</p>`;

  const regenerativeIntents = ["Regenerative", "Sustainable", "Circular", "Net Positive", "Impact"];
  const healthyIntents = ["Be an organisation healthy for staff (e.g. Teal)", "Serve the community", "Stay true to my purpose"];
  const shareholderIntents = ["Maximise shareholder value", "Profitable exit for investors, founders, and key staff"];

  if (regenerativeIntents.includes(R_business_intent)) {
    if (Z_scored_level === 5 && Y_scored_level === 5 && X_scored_level === 5) {
      body += "<p>you have, or are building, the strongest foundations around. Well done! If we’re not already in contact, we’d love to get to know you and your company better.</p>";
    } else if (Z_scored_level >= 4 && Y_scored_level >= 4 && X_scored_level >= 4) {
      body += `<p>your ${DAO_form} is almost strong enough; and your work / organisation design is strong enough; and your human foundation is strong enough. Well done! You’re likely building foundations way stronger than most! To find out where you can get even stronger, buy the follow-on consulting session.</p>`;
    } else if (Z_scored_level === 3) {
      body += `<p>even though you’re incorporating in a new way that superbly solves many of the problems business causes, you’re still within the old paradigm. Your incorporation foundation’s strength is marginal vs. your intention to be truly ${R_business_intent}. Your incorporation form has weakness that will eventually fail under the load of achieving your intention, or you will weaken your intent to match your incorporation foundations.</p>`;
      if (Y_scored_level >= 4) {
        body += "<p>your organisation design is strong enough, but will likely be weakened over time by your incorporation; </p>";
      } else if (Y_scored_level >= 2) {
        body += "<p>your organisation design foundation’s strength is marginal; </p>";
      } else {
        body += "<p>your organisation design foundation’s strength is too weak and will break under the load, or you will weaken your intent to match your foundations. </p>";
      }
      if (X_scored_level >= 4) {
        body += "<p>your human foundation is strong enough, but will likely be weakened over time by your incorporation. </p>";
      } else if (X_scored_level >= 2) {
        body += "<p>your human foundation’s strength is marginal; </p>";
      } else {
        body += "<p>your human foundation’s strength is too weak and will break under the load, or you will weaken your intent to match your foundations. </p>";
      }
      body += "<p>Your intentions are sound, and you’re putting in your best efforts, but there are proven ways to do better. To find out where you can get your foundations even stronger, and reduce the risk of mission creep or your foundations breaking, buy the follow-on consulting session.</p>";
    } else {
      body += "<p>your incorporation foundation’s strength is inadequate, and has serious weakness that will eventually fail under the load of achieving your intention, or you will weaken your intent to match your incorporation foundations.</p>";
      if (Y_scored_level >= 4) {
        body += "<p>your organisation design though is strong enough, but will be dragged down over time by your incorporation; </p>";
      } else if (Y_scored_level >= 2) {
        body += "<p>your organisation design foundation’s strength is marginal; </p>";
      } else {
        body += "<p>your organisation design foundation’s strength is too weak and will break under the load. </p>";
      }
      if (X_scored_level >= 4) {
        body += "<p>your human foundation is strong enough, but likely be dragged down over time by your incorporation; </p>";
      } else if (X_scored_level >= 2) {
        body += "<p>your human foundation’s strength is marginal; </p>";
      } else {
        body += "<p>your human foundation’s strength is too weak and will break under the load. </p>";
      }
      body += "<p>Your intentions are sound, and you’re probably getting exhausted trying yourself to carry the load your foundations are too weak for. There are proven ways to do better, with less stress for yourself! To find out where you can get your foundations even stronger, and reduce the risk of mission creep or your foundations breaking, buy the follow-on consulting session.</p>";
    }
  } else if (healthyIntents.includes(R_business_intent)) {
    // ... logic for healthy intents
  } else if (shareholderIntents.includes(R_business_intent)) {
    // ... logic for shareholder intents
  }

  if (Z_self_assessment_level !== -1) {
    if (Z_scored_level === Z_self_assessment_level) {
      body += "<p>Your self-assessment of your level of incorporation and our initial automated evaluation are the same!</p>";
    } else if (Z_scored_level > Z_self_assessment_level) {
      body += "<p>Your self-assessment of your level of incorporation is lower than our initial automated evaluation! Are you a little harsh on yourself at times?</p>";
    } else {
      body += "<p>Your self-assessment of your level of incorporation is higher than our initial automated evaluation! Are you at risk of being surprised by your foundations breaking when you most need them?</p>";
    }
  }
  if (Z_scored_level === 3 || Z_self_assessment_level === 3) {
    body += "<p>Note that there is a range of companies we class as level 3. This diagnostic is not intended to distinguish between them. All of them are significant improvements over the standard company or cooperative, but fall short of the level of agency needed to support the new economic paradigm we need.</p>";
  }

  if (Y_self_assessment_level !== -1) {
    if (Y_scored_level === Y_self_assessment_level) {
      body += "<p>Your self-assessment of your work / organisation design level and our initial automated evaluation are the same!</p>";
    } else if (Y_scored_level > Y_self_assessment_level) {
      body += "<p>Your self-assessment of your work / organisation design level is lower than our initial automated evaluation! Are you a little harsh on yourself at times?</p>";
    } else {
      body += "<p>Your self-assessment of your work / organisation design level is higher than our initial automated evaluation! Are you at risk of being surprised by your work / organisation design foundations breaking when you most need them?</p>";
    }
  }

  if (X_self_assessment_level !== -1) {
    if (X_scored_level === X_self_assessment_level) {
      body += "<p>Your self-assessment of your human foundation’s level and our initial automated evaluation are the same!</p>";
    } else if (X_scored_level > X_self_assessment_level) {
      body += "<p>Your self-assessment of your human foundation’s level is lower than our initial automated evaluation! Are you a little harsh on yourself at times?</p>";
    } else {
      body += "<p>Your self-assessment of your human foundation’s level is higher than our initial automated evaluation! Are you at risk of being surprised by your human foundations breaking when you most need them?</p>";
    }
  }

  body += '<p>You can find more information about the incorporation dimension in my YouTube channel, especially in <a href="https://www.youtube.com/playlist?list=PL35xWnDyNa_97x7_I06ytop8Jg9PfGcDL">this playlist</a> for entrepreneurs.</p>';
  body += '<p>You can also take <a href="https://www.evolutesix.com/regenerative-foundations-online">this online course</a> and read about the three foundational dimensions in <a href="https://drive.google.com/file/d/1WB2nOdgdrcptWHKrd7jThnIUOtVqfNBV/view?usp=sharing">this extract</a> from my book Rebuild the Economy, Leadership, and You.</p>';

  const ergodicityQuestion = "How do your business operations reflect the relative impact of unpredictability (luck) vs. skill and effort on your business results? (Profit, valuation, impact, etc.)";
  const ergodicityResponse = response[ergodicityQuestion];
  if (ergodicityResponse === "Skill and effort are the primary drivers of business performance, business is a meritocracy. We only have robust ways of maximising the business outcomes of skill and effort.") {
    body += "<p>Regarding your approach to hedging against bad luck, and seizing the opportunities good luck brings, you’re leaving potential lying on the table, and are needlessly exposed to risk. You’re also likely to be mis-attributing outcomes of profit or loss to skills / effort being strong or weak respectively. So you may believe someone is good or no good, but they were just lucky or unlucky respectively. This is neither beneficial for you nor for your investors.</p>";
  } else if (ergodicityResponse === "Both are important. We have robust ways of maximising the business outcomes of skill and effort, but little formal resource pooling with other companies and our investors to hedge against detrimental and for beneficial unpredictabilities.") {
    body += "<p>Regarding your approach to hedging against bad luck, and seizing the opportunities good luck brings, you have some understanding of the relationship between skill and effort on the one hand, and unpredictability on the other. But you only have strong foundations on the skills / effort side, not to maximise outcomes from unpredictability. So you’re leaving potential lying on the table, and are needlessly exposed to risk. You’re likely to be appropriately attributing outcomes of profit or loss to skills / effort vs. unpredictability (good or bad luck). But you could do much better with unpredictables! This improvement would be beneficial for you and for your investors.</p>";
  } else if (ergodicityResponse === "Both are important. We have robust ways of maximising the business outcomes of skill and effort, and some resources are pooled with other companies and investors to hedge against detrimental and for beneficial unpredictabilities.") {
    body += "<p>Regarding your approach to hedging against bad luck, and seizing the opportunities good luck brings, you have an understanding of the relationship between skill and effort on the one hand, and unpredictability on the other. You have good foundations on both sides. But you could do even better with unpredictables! This improvement would be beneficial for you and for your investors.</p>";
  } else if (ergodicityResponse === "Both are important. We have robust ways of maximising the business outcomes of skill and effort, and robust pooling mechanisms including profit pooling within a diverse ecosystem of multiple companies to hedge against detrimental and for beneficial unpredictabilities.") {
    body += "<p>You seem to have an excellent understanding of the relationship between skills / effort and unpredictability, which you seem to have used to build solid foundations to maximise the outcomes from each. Of course, there may well be areas where you can do even better!</p>";
  }

  const theoryXQuestion = "38. The human structures and processes are based on the belief about people's motivation";
  const theoryXResponse = response[theoryXQuestion];
  if (theoryXResponse === "people are inherently lazy and must be controlled, incentivised, and threatened") {
    body += "<p>You also most likely have significant upside potential for better results by strengthening the way your foundations increase people’s inner motivations. This is well-proven, especially in volatile times, to lead to faster, more effective responses to events. And so delivers better outcomes for you and your investors.</p>";
  } else if (theoryXResponse === "people are intrinsically self-motivated and creative") {
    body += "<p>You’ve grasped the power of tapping into intrinsic motivation! ";
    if (Z_scored_level >= 4 && Y_scored_level >= 4 && X_scored_level >= 4) {
      body += "And you seem to have built the right foundations to maximise people’s (and teams’) agency to maximise their intrinsic motivation and turn it into excellent results! Well done! Would you say no to a better way?</p>";
    } else if (Z_scored_level >= 1 && Y_scored_level >= 2 && X_scored_level >= 2) {
      body += "And you seem to have built some foundations towards enabling people’s (and teams’) agency to maximise their intrinsic motivation and turn it into excellent results, but there are well-proven ways of building far more enabling foundations.</p>";
    } else {
      body += "But you seem to have built foundations that fall short of what you need to really enable people’s (and teams’) agency to maximise their intrinsic motivation and turn it into excellent results. There are well-proven ways of building far more enabling foundations.</p>";
    }
  }

  const growthMindsetQuestion = "The human structures and processes are based on the belief about people's skills";
  const growthMindsetResponse = response[growthMindsetQuestion];
  if (growthMindsetResponse === "you either are “good” at something or not - mostly people just cannot learn new things") {
    body += "<p>Since you seem to believe that people can’t develop very much, regardless of the support given to them, you’re likely going to carry higher costs and higher risks as your business scales. Also, in the face of our ever more volatile and unpredictable world, slower reaction times and weaker innovation. You would be well served by asking yourself what has led to your beliefs about people, and how confident you are that they are absolutely true, everywhere and always, for everyone.</p>";
  } else if (growthMindsetResponse === "you can learn pretty much anything - if you stick to ongoing training and have support from the organisation") {
    body += "<p>Your beliefs about people’s capacity to develop in response to challenges, given the right support, are powerful enablers for success! So long as you put in place both ways of recognising each person’s development edge (including your own!) and the scaffolding each person needs, your chances of success are better than most!</p>";
  } else if (growthMindsetResponse === "you can learn new things easily by yourself") {
    body += "<p>Your beliefs about people’s capacity to develop in response to challenges are enablers for success. However, because you seem to expect them to do so without systemic support from the organisation you’re likely limiting development (yours as well) to the zone of self-supported development. To develop at one’s developmental edge requires both ways of recognising each person’s development edge (including your own!) and the scaffolding each person needs. Only if you do that will your chances of success be better than most!</p>";
  }

  const challengesQuestion = "The human structures and processes are based on the belief about challenges";
  const challengesResponse = response[challengesQuestion];
  if (challengesResponse === "all challenges can be overcome with perseverance and learning/hiring new skills, buying new technology") {
    body += "<p>You seem to deal with challenges primarily through perseverance, trying harder, learning or hiring new skills, and buying new technology. This will lead to missed opportunities and additional risks as you scale, and when unpredictable challenges and opportunities arise. Because in these cases our identity, our beliefs about how the world works, are the primary limiting factors. For example, Kodak, Blackberry, and Blockbuster all failed in the face of disruption because their leadership identified with their business. And so could not change their business because they could not see the need to change themselves first. Don’t be another Kodak, Blackberry, or Blockbuster!</p>";
  } else if (challengesResponse === "some challenges can only be overcome if we change ourselves") {
    body += `<p>Well done! You’ve recognised that some challenges require us to change our identity. To do so requires your work and human dimensions to enable sufficient agency, individually and collectively. Your work dimension scored ${Y_scored_level}, ${AGENCY_NAME[Y_scored_level]}. `;
    if (Y_scored_level >= 4) {
      body += "This is likely good enough for your needs, and puts you in the top bracket globally!</p>";
    } else if (Y_scored_level >= 2) {
      body += "This is better than most, but could still be improved!</p>";
    } else {
      body += "This really ought to be improved as fast as you can!</p>";
    }
    body += `<p>Your human dimension your score is: ${X_scored_level} ${AGENCY_NAME[X_scored_level]}. `;
    if (X_scored_level >= 4) {
      body += "This is likely good enough for your needs, and puts you in the top bracket globally!</p>";
    } else if (X_scored_level >= 2) {
      body += "This is better than most, but could still be improved!</p>";
    } else {
      body += "This really ought to be improved as fast as you can!</p>";
    }
    if (X_scored_level < 4 || Y_scored_level < 4) {
      body += "<p>Improvement is especially important for the growing volatility and unpredictability we’re already experiencing, and that we expect to increase with time.</p>";
    }
  }

  body += `<p>${R_first_name}, there’s a lot more you can get out of the data you’ve given us in a strategic dialogue. We’ve heard time and time again from other people in your ${analysis.R_role} role “I didn’t even know that that was possible”. If you’re sure that nothing of value can come from one initial consulting session with us, then we in Evolutesix wish you all success, and hope to read good news about you one day in the headlines! Otherwise <a href="https://www.evolutesix.com/legal-od-strong-enough">take our initial consulting session</a>.</p>`;

  body += "<p>Thank you for your time filling in this assessment!</p>";
  const feedbackQuestions = Object.keys(response).filter(q => q.startsWith("Feedback or comments"));
  if (feedbackQuestions.some(q => response[q])) {
    body += "<p>We appreciate the feedback you have already given us while filling in the form. We’d love to hear more from you, especially if you have any questions, or any additional feedback on the assessment itself or this email.</p>";
  } else {
    body += "<p>We’d love to hear from you, especially if you have any questions, or any feedback on the assessment itself or this email.</p>";
  }

  return { subject: "Your Company's Foundation Analysis", body };
}

function processDimensionX(response, X_running_total) {
  const xQuestion = "What kind of human development and culture do you have? Choose the one that most closely describes what is happening in practice, not what may be written down.";
  const xResponse = response[xQuestion];
  let X_self_assessment_text = "";
  let X_self_assessment_level = 0;

  switch (xResponse) {
    case "It's all about making best use of the skills staff have, hiring when we need new skills, firing when we no longer need someone's skills, to deliver the immediate tasks ahead of us.":
      X_self_assessment_text = "Short term gain";
      X_self_assessment_level = 0;
      break;
    case "People are hired for the long term fit, so individual skills are regularly strengthened and new skills developed so that today's staff are fit for future tasks.":
      X_self_assessment_text = "Strengths and skills";
      X_self_assessment_level = 1;
      break;
    case "In addition to developing business relevant skills, personal development of the whole person is encouraged.":
      X_self_assessment_text = "Psychological safety";
      X_self_assessment_level = 2;
      break;
    case "Developing business relevant skills and the whole person is not just encouraged, it is common practice.":
      X_self_assessment_text = "Inner development is a common practice";
      X_self_assessment_level = 3;
      break;
    case "Development is systemic: the company has gone beyond common practice, skills and whole person development happens continuously and systemically as an integral part of work.":
      X_self_assessment_text = "Systemic inner development";
      X_self_assessment_level = 4;
      break;
    case "Development is a core purpose at the same priority level any other top level business purpose, e.g. the customer purpose(s).":
      X_self_assessment_text = "Inner development is a core purpose";
      X_self_assessment_level = 5;
      break;
    case "Other":
      X_self_assessment_text = response[xQuestion + " (Other)"];
      X_self_assessment_level = -1;
      break;
  }

  const questionMap = {
    "X1: How is employee performance most often discussed or evaluated?": [-10, 0, 10],
    "X2: What happens when someone struggles to meet expectations?": [-10, 0, 5, 10],
    "X3: What happens when someone exceeds expectations consistently?": [-10, 0, 10],
    "X4: How frequently do people receive feedback focused on growth?": [-10, 0, 10],
    "X5: What is the default response to employee mistakes?": [-10, 0, 10],
    "X6: What role does psychological safety play in team culture?": [-10, 0, 5, 10],
    "X7: How visible is inner development (current stage and developmental edge) in meetings or strategy reviews?": [-10, 0, 10],
    "X8: How is success defined for employees?": [-10, 0, 10],
    "X9: How are development resources allocated?": [-10, 0, 5, 10],
    "X10: What level of agency do people have over their development path (skills and inner development)?": [-10, -5, 0, 5, 10],
    "X11: How well are individual purposes and company purpose actively aligned in order to benefit both?": [-10, 0, 10],
    "X12: How is inner development woven into the company’s identity and operations?": [-10, -5, 0, 5, 10],
    "X13: How are people included in setting their personal development goals within the company?": [-10, -5, 5, 10],
    "X14: How are power and decision-making influenced by people’s relational and emotional intelligence?": [-10, 0, 10],
    "X15: To what extent is there a common language and clear principles giving structure and clear communication for inner development?": [-10, -5, 0, 5, 10],
    "X16: How is conflict between peers or upward (from junior to senior roles) seen and treated in the organisation?": [-10, -5, 5, 10],
    "X17: How strongly do you agree: the organisation's structures, processes, culture, leaders, and investors see inner development as an integral purpose of work and the company, equal to any financial metric?": [-10, -5, 0, 5, 10],
    "X18: How strongly do you agree: people are encouraged and supported to stay in a role only when they are learning something and being challenged?": [-10, -5, 0, 5, 10]
  };

  for (const question in questionMap) {
    const responseValue = response[question];
    if (responseValue) {
      const scoreIndex = parseInt(responseValue.split(" ")[0]) - 1;
      if (!isNaN(scoreIndex) && scoreIndex >= 0 && scoreIndex < questionMap[question].length) {
        X_running_total += questionMap[question][scoreIndex];
      }
    }
  }

  let X_scored_level = 0;
  if (X_running_total < -150) {
    X_scored_level = 0;
  } else if (X_running_total >= -149 && X_running_total < 0) {
    X_scored_level = 1;
  } else if (X_running_total >= 1 && X_running_total < 100) {
    X_scored_level = 2;
  } else if (X_running_total >= 101 && X_running_total < 145) {
    X_scored_level = 3;
  } else if (X_running_total >= 146 && X_running_total < 170) {
    X_scored_level = 4;
  } else if (X_running_total >= 171) {
    X_scored_level = 5;
  }

  return { X_running_total, X_self_assessment_text, X_self_assessment_level, X_scored_level };
}

function generateSelfAssessmentEmail(subject) {
  let body = "<p>Hello,</p><p>Thank you for completing the self-assessment.</p>";
  body += "<p>As you chose to only provide your self-assessment we cannot give you any guidance on possible discrepancies between your foundation’s actual strength versus your beliefs.</p>";
  body += "<p>Best regards,<br>Your Name</p>";
  return { subject, body };
}

function generateIncorporationOnlyEmail(analysis, subject) {
  let body = "<p>Hello,</p><p>Thank you for completing the incorporation assessment.</p>";
  body += "<p>As you chose to only provide input on your incorporation, not on your operations (work and human dimensions), this analysis is only applicable to your incorporation.</p>";
  // ... add analysis of dimension z here ...
  body += "<p>Best regards,<br>Your Name</p>";
  return { subject, body };
}

function sendEmail(email, recipient) {
  MailApp.sendEmail(recipient, email.subject, email.body, { htmlBody: email.body });
}
