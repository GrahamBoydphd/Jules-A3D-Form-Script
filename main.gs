/**
 * @OnlyCurrentDoc
 */

function onFormSubmit(e) {
  Logger.log("onFormSubmit started");
  // Get the form response
  const itemResponses = e.response.getItemResponses();
  Logger.log("itemResponses count: " + itemResponses.length);

  // Define variables to hold the answers
  let R_first_name = "";
  let R_last_name = "";
  let R_company_name = "";
  let R_role = "";
  let R_business_intent = "";
  let R_sector = "";
  let R_exit_strategy = "";
  let R_incorporated_flag = false;
  const Agency_name = ["No agency", "Very restricted agency", "Limited agency", "Some agency", "Good agency", "Full agency"];
  let R_DAO_flag = false;
  let DAO_form = "incorporation";
  let Y_running_total = 0;
  let X_running_total = 0;
  let R_only_self_assessment_flag = false;
  let Z_self_assessment_text = "";
  let Z_self_assessment_level = 0;
  let z_level_scores = [0, 0, 0, 0, 0, 0];
  let R_only_incorporation_flag = false;
  let Y_self_assessment_text_long = "";
  let Y_self_assessment_text = "";
  let Y_self_assessment_level = 0;
  let X_self_assessment_text_long = "";
  let X_self_assessment_text = "";
  let X_self_assessment_level = 0;
  let ergodicity_response = "";
  let theory_x_y_response = "";
  let growth_mindset_response = "";
  let technical_vs_adaptive_response = "";
  let feedback_comments = [];

  // Helper function to get response by question
  function getResponseByQuestion(question) {
    for (let i = 0; i < itemResponses.length; i++) {
      if (itemResponses[i].getItem().getTitle() === question) {
        return itemResponses[i].getResponse();
      }
    }
    Logger.log("Question not found: " + question);
    return null;
  }

  // Assign values from form responses
  R_first_name = getResponseByQuestion("Please enter your first / given name");
  R_last_name = getResponseByQuestion("Please enter your last / family name");
  R_company_name = getResponseByQuestion("Your company's name");
  R_role = getResponseByQuestion("Please enter your role");
  R_business_intent = getResponseByQuestion("Your overarching business intent is (tick the most dominant one; choose the one closest if none of the options is exactly right)");
  R_sector = getResponseByQuestion("What industry/sector are you operating in? (Choose the one closest to your centre)");
  R_exit_strategy = getResponseByQuestion("Your exit strategy is to:");

  let incorporatedResponse = getResponseByQuestion("I'm answering these questions according to how the company");
  if (incorporatedResponse === "is already incorporated") {
    R_incorporated_flag = true;
  }

  let daoResponse = getResponseByQuestion("Are you using a DAO?");
  if (daoResponse !== "No") {
    R_DAO_flag = true;
    DAO_form = "DAO / incorporation";
  }

  let onlySelfAssessmentResponse = getResponseByQuestion("Do you want to go on to the more detailed health check of the actual strength of your incorporation?  If you want to end here, at the self-assessment, choose no");
  if (onlySelfAssessmentResponse !== "Yes, I want to the detailed assessment of the incorporation dimension. After that I can choose to assess the work and human dimensions too. The incorporation assessment will take 5 to 10 minutes") {
    R_only_self_assessment_flag = true;
  }
  Logger.log("R_only_self_assessment_flag: " + R_only_self_assessment_flag);

  // Dimension Z
  let zSelfAssessmentResponse = getResponseByQuestion("If already incorporated, the company's incorporation form is a (choose the closest legal form in your jurisdiction). If not yet incorporated, choose the one you currently intend to use");
  Z_self_assessment_text = zSelfAssessmentResponse;
  Logger.log("zSelfAssessmentResponse: " + zSelfAssessmentResponse);
  switch (zSelfAssessmentResponse) {
    case "A private limited company": Z_self_assessment_level = 0; break;
    case "A public limited company": Z_self_assessment_level = 0; break;
    case "An Employee Owned Trust or equivalent": Z_self_assessment_level = 1; break;
    case "A single stakeholder cooperative": Z_self_assessment_level = 2; break;
    case "A multistakeholder cooperative, where voting rights are equitably split across multiple classes of members, e.g. a Somerset Rules cooperative": Z_self_assessment_level = 3; break;
    case "A steward-owned company": Z_self_assessment_level = 3; break;
    case "A public benefit company": Z_self_assessment_level = 3; break;
    case "A perpetual purpose trust": Z_self_assessment_level = 3; break;
    case "A Community Interest Company": Z_self_assessment_level = 3; break;
    case "A FairShares company": Z_self_assessment_level = 4; break;
    case "A FairShares Commons company": Z_self_assessment_level = 5; break;
    case "A foundation / charity": Z_self_assessment_level = 3; break;
    default: Z_self_assessment_level = -1; break;
  }
  Logger.log("Z_self_assessment_level: " + Z_self_assessment_level);

  let q1_z = getResponseByQuestion("Is buying shares all that’s needed to get voting rights? (Voting rights come automatically with financial investment.)");
  if (q1_z === "Yes") { z_level_scores[0] += 1; }
  else { z_level_scores[1] += 1; z_level_scores[2] += 1; z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; }

  let q2_z = getResponseByQuestion("Are shareholders (e.g.: investors, founders, stewards, customers, staff etc. according to the company shareholder structure) regarded as the owners of the company?");
  if (q2_z === "Yes") { z_level_scores[0] += 1; z_level_scores[1] += 1; z_level_scores[2] += 1; z_level_scores[3] += 1; z_level_scores[4] += 1; }
  else { z_level_scores[5] += 10; }

  let q3_z = getResponseByQuestion("How are staff (i.e., employees) included in the financial benefits of shareholding, so that they have a share of dividends and any growth in the company's value. (Tick all that apply)");
  if (q3_z && q3_z.includes("Only if staff buy or sell shares; they're included because they have invested, not because they are staff; there's no difference")) { z_level_scores[0] += 1; }
  if (q3_z && q3_z.includes("Staff benefit from a reduced share price, employee stock ownership plan (ESOP) or similar")) { z_level_scores[1] += 1; z_level_scores[2] += 1; z_level_scores[3] += 1; }
  if (q3_z && q3_z.includes("A percentage, but less than 50%, of the shares are reserved for, and can only be owned by staff. (i.e., staff can only sell them to other staff members)")) { z_level_scores[1] += 1; }
  if (q3_z && q3_z.includes("Over 50%, but less than 100%, of the shares are reserved for, and can only be owned by staff. (i.e., staff can only sell them to other staff members)")) { z_level_scores[1] += 2; z_level_scores[2] += 1; }
  if (q3_z && q3_z.includes("All of the shares are reserved for, and can only be owned by staff. (i.e., staff can only sell them to other staff members)")) { z_level_scores[1] += 2; z_level_scores[2] += 2; }
  if (q3_z && q3_z.includes("Qualifies legally as an employee owned company, e.g. because staff shares are held in an employee ownership trust with at least 51% of the shares")) { z_level_scores[1] += 10; }
  if (q3_z && q3_z.includes("There is a robust protection (e.g. a special share class) protecting the staff wealth share rights")) { z_level_scores[2] += 1; z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; }
  if (q3_z && q3_z.includes("Staff are receive a fair share of profit and / or company value growth via a mechanism based on their work contribution, independent of their financial investment")) { z_level_scores[4] += 5; z_level_scores[5] += 5; }

  let q4_z = getResponseByQuestion("How are staff (i.e., employees) included in the governance aspect of shareholding -- the staff share of governance / voting rights");
  if (q4_z && q4_z.includes("Staff only get voting rights when they buy voting shares just as any investor does")) { z_level_scores[0] += 5; }
  if (q4_z && q4_z.includes("Between 10% and 50% of the voting rights are reserved for staff, can only be exercised by staff, and cannot be sold to non-staff")) { z_level_scores[1] += 1; z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; }
  if (q4_z && q4_z.includes("Over 50% of the voting rights are reserved for staff, can only be exercised by staff, and cannot be sold to non-staff")) { z_level_scores[1] += 1; z_level_scores[2] += 1; z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; }
  if (q4_z && q4_z.includes("All (100%) of the voting rights are reserved for staff, can only be exercised by staff, and cannot be sold to non-staff")) { z_level_scores[1] += 1; z_level_scores[2] += 1; }
  if (q4_z && q4_z.includes("The company qualifies legally as an employee owned company, or there is some robust protection protecting the staff governance rights")) { z_level_scores[1] += 1; z_level_scores[2] += 1; z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; }

  let q5_z = getResponseByQuestion("Democratic Governance: your incorporation legally underpins the democratic governance by all its members (e.g. customers, workers) independent of how much was invested");
  if (q5_z === "Yes, and members have equal voting power (e.g. one member, one vote, no weighting)") { z_level_scores[2] += 1; z_level_scores[3] += 1; }
  else if (q5_z === "Yes, and members have unequal voting rights (e.g. one member, one vote but weighted in different stakeholder blocks)") { z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; }
  else { z_level_scores[0] += 1; z_level_scores[1] += 1; }

  let q6_z = getResponseByQuestion("Autonomy and Independence: your incorporation legally underpins it as an autonomous organisation governed by its members (e.g. workers, customers, community) to best enable it to fulfill its purpose. They are encouraged / expected to govern as stewards / in loco parentis on its behalf");
  if (q6_z === "Yes") { z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; }
  else { z_level_scores[0] += 1; z_level_scores[1] += 1; z_level_scores[2] += 1; z_level_scores[3] -= 1; z_level_scores[4] -= 1; z_level_scores[5] -= 10; }

  let q7_z = getResponseByQuestion("There are qualifying criteria (beyond simply buying a share) that members (shareholders) of the company must satisfy to become members");
  if (q7_z === "Yes") { z_level_scores[1] += 1; z_level_scores[2] += 1; z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; }
  else { z_level_scores[0] += 10; }

  let q8_z = getResponseByQuestion("There are multiple classes of members / shareholders with distinct qualifying criteria, rights and obligations. If yes, tick all that apply. For example, you have classes for stewards and/or founders, staff, customers, suppliers, voting investors, non-voting investors. (Tick all that apply)");
  if (q8_z && q8_z.includes("No")) { z_level_scores[0] += 1; z_level_scores[1] += 1; z_level_scores[2] += 1; }
  if (q8_z && q8_z.includes("Yes, there are different classes, with distinct qualifying criteria independent of financial investment for all but the (perhaps non-voting) investor shares")) { z_level_scores[0] -= 1; z_level_scores[1] += 1; z_level_scores[2] -= 1; z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; }
  if (q8_z && q8_z.includes("Yes, and voting power is fairly shared across all, weighted across the different classes so that no single class can dominate over the others")) { z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; }
  if (q8_z && q8_z.includes("Yes, and multiple classes have a fair share of any profit / operating surplus")) { z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; }
  if (q8_z && q8_z.includes("Yes, and each class has a fair share of any increase in the company value")) { z_level_scores[4] += 4; z_level_scores[5] += 4; }
  if (q8_z && q8_z.includes("Yes, and only the investor class shares are tradable, all other classes are non-tradable and withdrawn whenever the member ceases to satisfy the qualifying criteria for the class")) { z_level_scores[3] += 2; z_level_scores[4] += 5; z_level_scores[5] += 5; }

  let q9_z = getResponseByQuestion("Does the company have a purpose, beyond e.g. maximising total shareholder return; and this purpose is explicitly written into the articles of incorporation or equivalent legal document legally binding for both operating and shareholder decisions; and with a significant / super majority threshold to change");
  if (q9_z === "The company legally anchors itself in a purpose statement, written into the incorporation documentation and binding on governance and operations") { z_level_scores[2] += 1; z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; }
  else if (q9_z === "The company legally anchors itself even deeper than purpose, in a driver statement, the external context and need, from which the purpose is visibly derived") { z_level_scores[5] += 5; }
  else { z_level_scores[0] += 5; z_level_scores[1] += 1; z_level_scores[3] -= 1; z_level_scores[4] -= 1; z_level_scores[5] -= 5; }

  let q10_z = getResponseByQuestion("Stewardship rights, obligations, and role in governance (tick all that apply)");
  if (q10_z && q10_z.includes("No stewards exist in any voting role in the company")) { z_level_scores[0] += 1; z_level_scores[1] += 1; z_level_scores[2] += 1; z_level_scores[5] -= 10; }
  if (q10_z && q10_z.includes("The company has stewards, but they have less voting weight than the largest voting block, or do not have veto power")) { z_level_scores[0] -= 5; z_level_scores[3] += 1; z_level_scores[4] += 1; }
  if (q10_z && q10_z.includes("Stewards are required to vote according to legally binding principles of stewardship")) { z_level_scores[3] += 1; z_level_scores[5] += 1; }
  if (q10_z && q10_z.includes("Stewards represent nature as a whole in governance, and at least one has expertise in that")) { z_level_scores[5] += 1; }
  if (q10_z && q10_z.includes("Stewards represent future generations as a whole in governance, and at least one has expertise in that")) { z_level_scores[5] += 1; }
  if (q10_z && q10_z.includes("Stewards represent the essence, integrity, etc. of the company as an independent entity to any and all stakeholders, and at least one has expertise in that")) { z_level_scores[3] += 1; z_level_scores[5] += 1; }
  if (q10_z && q10_z.includes("Stewards have veto power if any shareholder proposal risks irrevocably breaking one of the principles of stewardship")) { z_level_scores[3] += 1; z_level_scores[5] += 1; }

  let q11_z = getResponseByQuestion("How well does your company make explicit, and express in practice, that its legal personhood means that it is legally a free person, not an ownable thing, and especially that it is not owned by the shareholders?");
  switch (q11_z) {
    case "1": z_level_scores[0] += 1; z_level_scores[1] += 1; z_level_scores[2] += 1; z_level_scores[3] += 1; z_level_scores[5] -= 5; break;
    case "2": z_level_scores[0] += 1; z_level_scores[1] += 1; z_level_scores[2] += 1; z_level_scores[3] += 1; z_level_scores[5] -= 3; break;
    case "3": z_level_scores[5] -= 1; break;
    case "4": z_level_scores[0] -= 5; z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; break;
    case "5": z_level_scores[0] -= 5; z_level_scores[1] -= 1; z_level_scores[4] += 1; z_level_scores[5] += 5; break;
  }

  let q12_z = getResponseByQuestion("Do the company statutes and governance prevent the company from being bought or sold even if the investors; or the staff / customers in a cooperative; or some other subset of stakeholders decides to?");
  if (q12_z === "Yes, there are mechanisms to prevent the company being sold") { z_level_scores[0] -= 5; z_level_scores[2] += 1; z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; }
  else { z_level_scores[0] += 5; z_level_scores[1] += 1; }

  let q13_z = getResponseByQuestion("Multicapital governance: is each capital (e.g. the six capitals defined by the Integrated Reporting Framework) that the company directly depends on or impacts (beyond negligible or tangential impact) represented in governance by stakeholders and / or stewards, with the power and the mandate to hold the company to account for outcomes, and an equitable share of power?");
  if (q13_z === "Yes, multiple capitals are represented in governance with a fair share of power") { z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; }
  else if (q13_z === "No") { z_level_scores[4] -= 5; z_level_scores[5] -= 5; }

  let q14_z = getResponseByQuestion("Multicapital reward: is each capital (e.g. the six capitals defined by the Integrated Reporting Framework) that is invested entitled to receive a fair share of any financial growth (e.g. a fair share of dividends and capital growth)? Perhaps via representing stakeholders, and where these have the power and the mandate to hold the company to account for maintaining a fair share?");
  if (q14_z === "Profit: Yes, all get a fair share of profit generated") { z_level_scores[4] += 1; z_level_scores[5] += 1; }
  else if (q14_z === "Company value: Yes, all get a fair share of gain in the company value") { z_level_scores[4] += 1; z_level_scores[5] += 1; }
  else if (q14_z === "Both: Yes, all get a fair share of both profit / surplus and gain in the company value") { z_level_scores[4] += 5; z_level_scores[5] += 5; }
  else if (q14_z === "No") { z_level_scores[4] -= 5; z_level_scores[5] -= 5; }

  let q15_z = getResponseByQuestion("Does the company regularly, on an ongoing basis, for perpetuity, (e.g. annually) rebalance shareholding | equity | tokens to reflect contributions / investments of non-financial capitals (e.g. time, intellectual, relationship, etc.) by staff and / or other stakeholders -- especially unremunerated staff / freelancers / stakeholders");
  if (q15_z === "Yes") { z_level_scores[4] += 5; z_level_scores[5] += 5; }
  else { z_level_scores[4] -= 5; z_level_scores[5] -= 5; }

  let q16_z = getResponseByQuestion("How well do the company's articles of incorporation and operating structures and structured interactions enable tangible cooperation with other companies, even those with competing businesses?");
  switch (q16_z) {
    case "1": z_level_scores[0] += 1; z_level_scores[1] += 1; break;
    case "2": z_level_scores[0] += 1; z_level_scores[1] += 1; z_level_scores[2] += 1; z_level_scores[3] += 1; break;
    case "3": z_level_scores[2] += 1; z_level_scores[3] += 1; z_level_scores[4] += 1; break;
    case "4": z_level_scores[4] += 1; z_level_scores[5] += 1; break;
    case "5": z_level_scores[4] += 2; z_level_scores[5] += 2; break;
  }

  let q17_z = getResponseByQuestion("How effectively is the company seen as, and incorporated to enable it to function as, a living being -- i.e., a collective living system with collective intelligence, culture (collective beliefs) composed of human beings as the individual cells?");
  switch (q17_z) {
    case "1": z_level_scores[0] += 1; z_level_scores[1] += 1; z_level_scores[4] -= 1; z_level_scores[5] -= 1; break;
    case "2": z_level_scores[0] += 1; z_level_scores[1] += 1; z_level_scores[2] += 1; z_level_scores[4] -= 1; z_level_scores[5] -= 1; break;
    case "3": z_level_scores[2] += 1; z_level_scores[3] += 1; break;
    case "4": z_level_scores[4] += 1; z_level_scores[5] += 1; break;
    case "5": z_level_scores[3] -= 1; z_level_scores[4] += 1; z_level_scores[5] += 1; break;
  }

  let q18_z = getResponseByQuestion("How explicitly clear is it in the company's structures and governance that the purpose of financial capital is to serve life?");
  switch (q18_z) {
    case "1": z_level_scores[0] += 2; break;
    case "2": z_level_scores[1] += 1; break;
    case "3": z_level_scores[1] += 1; z_level_scores[2] += 1; z_level_scores[3] += 1; break;
    case "4": z_level_scores[2] += 1; z_level_scores[3] += 1; z_level_scores[4] += 1; z_level_scores[5] += 1; break;
    case "5": z_level_scores[4] += 1; z_level_scores[5] += 1; break;
  }

  let onlyIncorporationResponse = getResponseByQuestion("Do you want to also assess how fit for purpose your work and human structures and interactions are? If you want to end here, and only assess your incorporation, choose no");
  if (onlyIncorporationResponse !== "Yes, I want to assess all three dimensions of my company") {
    R_only_incorporation_flag = true;
  }
  Logger.log("R_only_incorporation_flag: " + R_only_incorporation_flag);

  let Z_scored_level = z_level_scores.indexOf(Math.max(...z_level_scores));
  Logger.log("z_level_scores: " + z_level_scores);
  Logger.log("Z_scored_level: " + Z_scored_level);

  // Dimension Y
  Y_self_assessment_text_long = getResponseByQuestion("What kind of organisation design do you have? Choose the one that most closely describes what you see happening in practice, not what's just written but not practiced. If you're not familiar with some options, you likely don't have that");
  Logger.log("Y_self_assessment_text_long: " + Y_self_assessment_text_long);
  switch (Y_self_assessment_text_long) {
    case "Hierarchy of roles with micro-management, each with a job description and title, senior roles closely manage the work of their direct reports; you rise in the hierarchy through promotion": Y_self_assessment_text = "Traditional hierarchy, significant micro-management"; Y_self_assessment_level = 0; break;
    case "Hierarchy of roles with delegation, each with a job description and title, senior roles define top level objectives and goals, then delegate accountability for how to deliver them to their direct reports; you rise in the hierarchy through promotion": Y_self_assessment_text = "Hierarchy, significant delegation"; Y_self_assessment_level = 1; break;
    case "We pretend to have a flat organisation, but there's a hidden hierarchy in practice": Y_self_assessment_text = "Hidden hierarchy"; Y_self_assessment_level = 1; break;
    case "Self-Managing, individuals have significant accountability for managing their own work, turning to line managers or similar when needed": Y_self_assessment_text = "Self-managing"; Y_self_assessment_level = 2; break;
    case "Self-Governing: individuals energise roles with high independent accountability, including the ability to change the role definition without approval from above (albeit with consent from other roles impacted by the proposed change)": Y_self_assessment_text = "Self-Governing"; Y_self_assessment_level = 3; break;
    case "Self-Directing: in addition to the above, individuals have significant autonomy in defining the objectives, goals, KPIs of their roles and areas of the business": Y_self_assessment_text = "Self-Directing"; Y_self_assessment_level = 4; break;
    case "Autopoietic: in addition to the above, there are structures and processes in place enabling staff (rather than only investors) to recognise and turn to action when it's time for the organisation to cease to exist, to create spin-offs / offspring, to merge with another organisation": Y_self_assessment_text = "Autopoietic"; Y_self_assessment_level = 5; break;
  }

  let q1_y = getResponseByQuestion("There are systems in place that encourage and support the orientation of all members of the organization along the strategic imperatives");
  if (q1_y) { Y_running_total += (parseInt(q1_y) - 3) * 5 || 0; }

  let q2_y = getResponseByQuestion("What is the relationship between managers and those below them with expertise?");
  if (q2_y) { Y_running_total += (parseInt(q2_y) - 3) * 5 || 0; }

  let q3_y = getResponseByQuestion("Who sets goals and how to achieve them?");
  switch (q3_y) {
    case "The boss sets your goals and defines how you must achieve them": Y_running_total -= 10; break;
    case "The boss sets your goals and we have limited freedom in how to achieve them": Y_running_total -= 5; break;
    case "The boss sets your goals and we have full freedom in how to achieve them, including how to distribute the workload": Y_running_total += 0; break;
    case "The boss sets your goals and we have full freedom in how to achieve them, including how to distribute the workload and how to optimise the organisation design, all according to overarching objectives, goals, and strategies": Y_running_total += 5; break;
    case "Teams set their own goals, how to achieve them, and can optimise the organisation design to increase their performance, according to overarching objectives, goals, and strategies": Y_running_total += 10; break;
  }

  let q4_y = getResponseByQuestion("Who has authority to define and change job / role descriptions including accountabilities?");
  if (q4_y) { Y_running_total += (parseInt(q4_y) - 3) * 5 || 0; }

  let q5_y = getResponseByQuestion("Decisions broader than within one role's accountability are made beyond simple hierarchy and beyond simple majority vote (e.g., via a consent principle)");
  if (q5_y) { Y_running_total += (parseInt(q5_y) - 3) * 5 || 0; }

  let q6_y = getResponseByQuestion("Systems are implemented that support the self-management of teams and roles");
  if (q6_y) { Y_running_total += (parseInt(q6_y) - 3) * 5 || 0; }

  let q7_y = getResponseByQuestion("There are ways all members of the organization can  instigate change processes leading to modified or new objectives / goals / purposes for the organisation as a whole, e.g. when frontline staff recognise that the business context has changed, and hence the company ought to consider a new direction (with input and consent needed only from roles / jobs affected by the proposed change, but not necessarily \"management\")");
  if (q7_y) { Y_running_total += (parseInt(q7_y) - 3) * 5 || 0; }

  let q8_y = getResponseByQuestion("Who decides on who joins or leaves a team?");
  if (q8_y) { Y_running_total += (parseInt(q8_y) - 3) * 5 || 0; }

  let q9_y = getResponseByQuestion("What is the primary role of senior management / leaders?");
  if (q9_y) { Y_running_total += (parseInt(q9_y) - 3) * 5 || 0; }

  let q10_y = getResponseByQuestion("What is the relative importance of the organisation’s survival vs. the purpose of the organisation?");
  if (q10_y) { Y_running_total += (parseInt(q10_y) - 3) * 5 || 0; }

  let q11_y = getResponseByQuestion("External stakeholder interfaces are fluid and permeable – stakeholders are seen as part of the system, co-creative, co-directing, actively contributing to the organisation meeting the broad external needs and context");
  if (q11_y) { Y_running_total += (parseInt(q11_y) - 3) * 5 || 0; }

  let Y_scored_level = 0;
  if (Y_running_total < -80) { Y_scored_level = 0; }
  else if (Y_running_total >= -79 && Y_running_total < -30) { Y_scored_level = 1; }
  else if (Y_running_total >= -29 && Y_running_total < 20) { Y_scored_level = 2; }
  else if (Y_running_total >= 21 && Y_running_total < 70) { Y_scored_level = 3; }
  else if (Y_running_total >= 71 && Y_running_total < 100) { Y_scored_level = 4; }
  else if (Y_running_total >= 101) { Y_scored_level = 5; }
  Logger.log("Y_running_total: " + Y_running_total);
  Logger.log("Y_scored_level: " + Y_scored_level);

  // Dimension X
  X_self_assessment_text_long = getResponseByQuestion("What kind of human development and culture do you have? Choose the one that most closely describes what is happening in practice, not what may be written down");
  Logger.log("X_self_assessment_text_long: " + X_self_assessment_text_long);
  switch (X_self_assessment_text_long) {
    case "It's all about making best use of the skills staff have, hiring when we need new skills, firing when we no longer need someone's skills, to deliver the immediate tasks ahead of us": X_self_assessment_text = "Short term gain"; X_self_assessment_level = 0; break;
    case "People are hired for the long term fit, so individual skills are regularly strengthened and new skills developed so that today's staff are fit for future tasks": X_self_assessment_text = "Strengths and skills"; X_self_assessment_level = 1; break;
    case "In addition to developing business relevant skills, personal development of the whole person is encouraged": X_self_assessment_text = "Psychological safety"; X_self_assessment_level = 2; break;
    case "Developing business relevant skills and the whole person is not just encouraged, it is common practice": X_self_assessment_text = "Inner development is a common practice"; X_self_assessment_level = 3; break;
    case "Development is systemic: the company has gone beyond common practice, skills and whole person development happens continuously and systemically as an integral part of work": X_self_assessment_text = "Systemic inner development"; X_self_assessment_level = 4; break;
    case "Development is a core purpose at the same priority level any other top level business purpose, e.g. the customer purpose(s)": X_self_assessment_text = "Inner development is a core purpose"; X_self_assessment_level = 5; break;
  }

  let q1_x = getResponseByQuestion("How is employee performance most often discussed or evaluated?");
  if (q1_x) { X_running_total += (parseInt(q1_x) - 2) * 10 || 0; }

  let q2_x = getResponseByQuestion("What happens when someone struggles to meet expectations?");
  if (q2_x) {
    if (q2_x === "1") { X_running_total -= 10; }
    else if (q2_x === "2") { X_running_total += 0; }
    else if (q2_x === "3") { X_running_total += 5; }
    else if (q2_x === "4") { X_running_total += 10; }
  }

  let q3_x = getResponseByQuestion("What happens when someone exceeds expectations consistently?");
  if (q3_x) { X_running_total += (parseInt(q3_x) - 2) * 10 || 0; }

  let q4_x = getResponseByQuestion("How frequently do people receive feedback focused on growth?");
  if (q4_x) { X_running_total += (parseInt(q4_x) - 2) * 10 || 0; }

  let q5_x = getResponseByQuestion("What is the default response to employee mistakes?");
  if (q5_x) { X_running_total += (parseInt(q5_x) - 2) * 10 || 0; }

  let q6_x = getResponseByQuestion("What role does psychological safety play in team culture?");
  if (q6_x) {
    if (q6_x === "1") { X_running_total -= 10; }
    else if (q6_x === "2") { X_running_total += 0; }
    else if (q6_x === "3") { X_running_total += 5; }
    else if (q6_x === "4") { X_running_total += 10; }
  }

  let q7_x = getResponseByQuestion("How visible is inner development (current stage and developmental edge) in meetings or strategy reviews?");
  if (q7_x) { X_running_total += (parseInt(q7_x) - 2) * 10 || 0; }

  let q8_x = getResponseByQuestion("How is success defined for employees?");
  if (q8_x) { X_running_total += (parseInt(q8_x) - 2) * 10 || 0; }

  let q9_x = getResponseByQuestion("How are development resources allocated?");
  if (q9_x) {
    if (q9_x === "1") { X_running_total -= 10; }
    else if (q9_x === "2") { X_running_total += 0; }
    else if (q9_x === "3") { X_running_total += 5; }
    else if (q9_x === "4") { X_running_total += 10; }
  }

  let q10_x = getResponseByQuestion("What level of agency do people have over their development path (skills and inner development)?");
  if (q10_x) { X_running_total += (parseInt(q10_x) - 3) * 5 || 0; }

  let q11_x = getResponseByQuestion("How well are individual purposes and company purpose actively aligned in order to benefit both?");
  if (q11_x) { X_running_total += (parseInt(q11_x) - 2) * 10 || 0; }

  let q12_x = getResponseByQuestion("How is inner development woven into the company’s identity and operations?");
  if (q12_x) { X_running_total += (parseInt(q12_x) - 3) * 5 || 0; }

  let q13_x = getResponseByQuestion("How are people included in setting their personal development goals within the company?");
  if (q13_x) {
    if (q13_x === "1") { X_running_total -= 10; }
    else if (q13_x === "2") { X_running_total -= 5; }
    else if (q13_x === "3") { X_running_total += 5; }
    else if (q13_x === "4") { X_running_total += 10; }
  }

  let q14_x = getResponseByQuestion("How are power and decision-making influenced by people’s relational and emotional intelligence?");
  if (q14_x) { X_running_total += (parseInt(q14_x) - 2) * 10 || 0; }

  let q15_x = getResponseByQuestion("To what extent is there a common language and clear principles giving structure and clear communication for inner development?");
  if (q15_x) { X_running_total += (parseInt(q15_x) - 3) * 5 || 0; }

  let q16_x = getResponseByQuestion("How is conflict between peers or upward (from junior to senior roles) seen and treated in the organisation?");
  if (q16_x) {
    if (q16_x === "1") { X_running_total -= 10; }
    else if (q16_x === "2") { X_running_total -= 5; }
    else if (q16_x === "3") { X_running_total += 5; }
    else if (q16_x === "4") { X_running_total += 10; }
  }

  let q17_x = getResponseByQuestion("How strongly do you agree: the organisation's structures, processes, culture, leaders, and investors see inner development as an integral purpose of work and the company, equal to any financial metric?");
  if (q17_x) { X_running_total += (parseInt(q17_x) - 3) * 5 || 0; }

  let q18_x = getResponseByQuestion("How strongly do you agree: people are encouraged and supported to stay in a role only when they are learning something and being challenged?");
  if (q18_x) { X_running_total += (parseInt(q18_x) - 3) * 5 || 0; }


  let X_scored_level = 0;
  if (X_running_total < -150) { X_scored_level = 0; }
  else if (X_running_total >= -149 && X_running_total < 0) { X_scored_level = 1; }
  else if (X_running_total >= 1 && X_running_total < 100) { X_scored_level = 2; }
  else if (X_running_total >= 101 && X_running_total < 145) { X_scored_level = 3; }
  else if (X_running_total >= 146 && X_running_total < 170) { X_scored_level = 4; }
  else if (X_running_total >= 171) { X_scored_level = 5; }
  Logger.log("X_running_total: " + X_running_total);
  Logger.log("X_scored_level: " + X_scored_level);

  ergodicity_response = getResponseByQuestion("How do your business operations reflect the relative impact of unpredictability (luck) vs. skill and effort on your business results? (Profit, valuation, impact, etc.)");
  theory_x_y_response = getResponseByQuestion("The human structures and processes are based on the belief about people's motivation");
  growth_mindset_response = getResponseByQuestion("The human structures and processes are based on the belief about people's skills");
  technical_vs_adaptive_response = getResponseByQuestion("The human structures and processes are based on the belief about challenges");

  // Collect feedback
  for (let i = 0; i < itemResponses.length; i++) {
    if (itemResponses[i].getItem().getTitle().startsWith("Feedback or comments")) {
      let response = itemResponses[i].getResponse();
      if (response) {
        feedback_comments.push(response);
      }
    }
  }
  Logger.log("feedback_comments: " + feedback_comments.length);

  // Construct email
  const subject = `Health check of the foundations of ${R_company_name} prepared for ${R_first_name} ${R_last_name}`;
  let emailBody = `<p>Hi ${R_first_name},</p>`;
  emailBody += `<p>Here is the first level evaluation of whether your foundations are strong enough to support your ${R_business_intent} business intention for your company ${R_company_name}. Please note that this automated first level evaluation is still in beta release. It is offered as is, any or all of the assessment may be a hallucination. If you find it useful to you and you put anything into action you do so at your own risk.</p>`;
  emailBody += `<p>So, how strong are your foundations, on a scale from 0 (no agency) to 5 (full agency) in each dimension? To build a truly viable future economy only full agency in all three dimensions is strong enough. Scoring 0 to 2 is inadequate, scoring 3 is marginal, scoring 4 is good, and scoring 5 is excellent! Of course even a score of 3 puts you in the top 1% vs. all other companies. So with 4 or 5 you really are pushing against the limits of today’s beliefs.</p>`;

  if (!R_only_self_assessment_flag && !R_only_incorporation_flag) {
    emailBody += `<ul>`;
    emailBody += `<li>For the ${DAO_form} dimension your score is: ${Z_scored_level} ${Agency_name[Z_scored_level]}</li>`;
    emailBody += `<li>For the work / organisation design dimension your score is: ${Y_scored_level} ${Agency_name[Y_scored_level]}.</li>`;
    emailBody += `<li>For the human dimension your score is: ${X_scored_level} ${Agency_name[X_scored_level]}.</li>`;
    emailBody += `</ul>`;
  } else if (!R_only_self_assessment_flag && R_only_incorporation_flag) {
    emailBody += `<p>Because you did the full healthcheck for the ${DAO_form} dimension only, and the self-assessment for the work and human dimensions, I can only compare your ${DAO_form} self-assessment and full evaluation. If you want a comparison between your actual strength and your perception of the work and human dimensions, please edit the form and fill in these dimensions in.</p>`;
    emailBody += `<ul>`;
    emailBody += `<li>For the ${DAO_form} dimension your score is: ${Z_scored_level} ${Agency_name[Z_scored_level]}</li>`;
    emailBody += `<li>For the work / organisation design dimension your self-assessment is: ${Y_self_assessment_level} ${Agency_name[Y_self_assessment_level]}</li>`;
    emailBody += `<li>For the human dimension your self-assessment is: ${X_self_assessment_level} ${Agency_name[X_self_assessment_level]}</li>`;
    emailBody += `</ul>`;
  } else if (R_only_self_assessment_flag) {
    emailBody += `<p>As you chose to only provide your self-assessment we cannot give you any guidance on possible discrepancies between your foundation’s actual strength versus your beliefs about your foundation’s strength.</p>`;
    emailBody += `<ul>`;
    emailBody += `<li>For the ${DAO_form} dimension your self-assessment is: ${Z_self_assessment_level} ${Agency_name[Z_self_assessment_level]}</li>`;
    emailBody += `<li>For the work / organisation design dimension your self-assessment is: ${Y_self_assessment_level} ${Agency_name[Y_self_assessment_level]}</li>`;
    emailBody += `<li>For the human dimension your self-assessment is: ${X_self_assessment_level} ${Agency_name[X_self_assessment_level]}</li>`;
    emailBody += `</ul>`;
  }

  if (R_DAO_flag) {
    emailBody += "Since you’re using a DAO, this automated questionnaire will give you good directional guidance on whether the strength of your foundations is enough for your intent, but to get more specificity for your precise approach you need the dialogue of the next stage, a consulting session.\n";
    if (daoResponse === "Yes, a pure DAO. If so, choose the answer for the remaining questions on incorporation that best reflects your DAO's structure and governance") {
        emailBody += "Because you’re using a pure DAO without legal personhood, the key question we ought to begin with is the potential liability of your members. For example, in the class action law suit against bZx DAO, the court found that the DAO was an unincorporated association, and as such the members could be held severally and jointly liable.\n";
    } else if (daoResponse === "Yes, and it is in a jurisdiction that recognises my DAO as a legal person, i.e., as incorporated. If so, choose the answer for the remaining questions on incorporation that best reflects the whole") {
        emailBody += "Well done using an incorporated DAO form, that gives you a stronger foundation than a pure unincorporated DAO.\n";
    } else if (daoResponse === "Yes, and I have wrapped the DAO in a legal entity. If so, choose the answer for the remaining questions on incorporation that best reflects the whole") {
        emailBody += "Well done using a DAO wrapped in an incorporated legal entity, that gives you a stronger foundation than a pure unincorporated DAO. One key question to address in a consulting session is the alignment of the DAO and legal entity governance, especially any gaps.\n";
    }
  }

  emailBody += `<p>Given your business intention is ${R_business_intent},</p>\n`;

  const regenerativeIntents = ["Regenerative", "Sustainable", "Circular", "Net Positive", "Impact", "Be an organisation healthy for staff (e.g. Teal)", "Serve the community", "Stay true to my purpose", "Maximise shareholder value", "Profitable exit for investors, founders, and key staff"];
  if (regenerativeIntents.includes(R_business_intent) && Z_scored_level === 5 && Y_scored_level === 5 && X_scored_level === 5) {
    emailBody += "<ul><li>you have, or are building, the strongest foundations around. Well done! If we’re not already in contact, we’d love to get to know you and your company better.</li></ul>\n";
  } else if (regenerativeIntents.includes(R_business_intent) && Z_scored_level === 4 && Y_scored_level >= 4 && X_scored_level >= 4) {
    emailBody += "<ul><li>your " + DAO_form + " is almost strong enough; and your work / organisation design is strong enough; and your human foundation is strong enough. Well done! You’re likely building foundations way stronger than most! You’ll find out more clearly where you can get your foundations even stronger in order to reduce the risk of mission creep or your foundations breaking when you sign up for the follow-on consulting session.</li></ul>\n";
  } else if (["Regenerative", "Sustainable", "Circular", "Net Positive", "Impact"].includes(R_business_intent)) {
      emailBody += "<ul>";
      if (Z_scored_level === 3) {
          emailBody += "<li>even though you’re incorporating in a new way that superbly solves many of the problems business causes, you’re still within the old paradigm. Your incorporation foundation’s strength is marginal vs. your intention to be truly " + R_business_intent + ". Your incorporation form has weakness that will eventually fail under the load of achieving your intention, or you will weaken your intent to match your incorporation foundations.</li>\n";
      } else if (Z_scored_level <= 2) {
          emailBody += "<li>your incorporation foundation’s strength is inadequate, and has serious weakness that will eventually fail under the load of achieving your intention, or you will weaken your intent to match your incorporation foundations.</li>\n";
      }
      if (Y_scored_level >= 4) {
          emailBody += "<li>your organisation design is strong enough, but will likely be weakened over time by your incorporation;</li>";
      } else if (Y_scored_level >= 2) {
          emailBody += "<li>your organisation design foundation’s strength is marginal;</li>";
      } else {
          emailBody += "<li>your organisation design foundation’s strength is too weak and will break under the load, or you will weaken your intent to match your foundations.</li>\n";
      }
      if (X_scored_level >= 4) {
          emailBody += "<li>your human foundation is strong enough, but will likely be weakened over time by your incorporation.</li>";
      } else if (X_scored_level >= 2) {
          emailBody += "<li>your human foundation’s strength is marginal;</li>";
      } else {
          emailBody += "<li>your human foundation’s strength is too weak and will break under the load, or you will weaken your intent to match your foundations.</li>\n";
      }
      emailBody += "</ul><p>Your intentions are sound, and you’re putting in your best efforts, but there are proven ways to do better. You’ll find out where you can get your foundations even stronger, and reduce the risk of mission creep or your foundations breaking when you sign up for the follow-on consulting session.</p>\n";
  } else if (["Be an organisation healthy for staff (e.g. Teal)", "Serve the community", "Stay true to my purpose"].includes(R_business_intent)) {
      emailBody += "<ul>";
      if (Z_scored_level === 3) {
          emailBody += "<li>even though you’re incorporating in a new way that superbly solves many of the problems business causes, and that may well be strong enough for you, you’re still within the old paradigm. Your incorporation foundation’s strength may still hamper your intention to be truly " + R_business_intent + ".</li>\n";
      } else if (Z_scored_level <= 2) {
          emailBody += "<li>your incorporation foundation’s strength is inadequate, and has serious weakness that will eventually fail under the load of achieving your intention, or you will weaken your intent to match your incorporation foundations.</li>\n";
      }
      if (Y_scored_level >= 4) {
          emailBody += "<li>your organisation design is strong enough, but may be weakened over time by your incorporation;</li>";
      } else if (Y_scored_level >= 2) {
          emailBody += "<li>your organisation design foundation’s strength is probably strong enough, though you’d definitely benefit by making it stronger;</li>";
      } else {
          emailBody += "<li>your organisation design foundation’s strength is too weak and will break under the load, or you will weaken your intent to match your foundations.</li>\n";
      }
      if (X_scored_level >= 4) {
          emailBody += "<li>your human foundation is strong enough;</li>";
      } else if (X_scored_level >= 2) {
          emailBody += "<li>your human foundation’s strength is probably strong enough, though you’d definitely benefit by making it stronger;</li>";
      } else {
          emailBody += "<li>your human foundation’s strength is too weak and will break under the load, or you will weaken your intent to match your foundations.</li>\n";
      }
      if (Z_scored_level >= 3 && Y_scored_level >= 3 && X_scored_level >= 3) {
          emailBody += "<li>Your intention to make the world a better place is admirable, and your foundations may well be strong enough for the load! You’ll get a more thorough assessment, a plan on how you can use proven ways to do better, with less stress for yourself, when you sign up for the follow-on consulting session.</li>\n";
      } else {
          emailBody += "<li>Your intention to make the world a better place is admirable, but your foundations may well break under the load! You’ll get a more thorough assessment, a plan on how you can use proven ways to do better, with less stress for yourself, when you sign up for the follow-on consulting session.</li>\n";
      }
      emailBody += "</ul>";
  } else if (["Maximise shareholder value", "Profitable exit for investors, founders, and key staff"].includes(R_business_intent)) {
      emailBody += "<ul>";
      if (Z_scored_level === 3) {
          emailBody += "<li>you’re incorporating in a new way that superbly solves many of the problems business causes.</li>";
      } else if (Z_scored_level === 2) {
          emailBody += "<li>your incorporation foundation’s strength as a cooperative may not suit your intention, one of the alternatives may be better for you;</li>";
      } else if (Z_scored_level === 1) {
          emailBody += "<li>your incorporation foundation’s strength as an employee-owned trust may be fine for your intention, but one of the alternatives may be better for you;</li>";
      } else {
          emailBody += "<li>your incorporation foundation’s strength may be strong enough for your intention over the short term, but it has weaknesses that may well break under the strain of the volatile business context of the near future;</li>";
      }
      if (Y_scored_level >= 4) {
          emailBody += "<li>your organisation design though is strong enough, but will be dragged down over time by your incorporation;</li>";
      } else if (Y_scored_level >= 2) {
          emailBody += "<li>your organisation design foundation’s strength is marginal, and may be negatively impacted by your incorporation foundation;</li>";
      } else {
          emailBody += "<li>your organisation design foundation’s strength is too weak and will break under the load.</li>";
      }
      if (X_scored_level >= 4) {
          emailBody += "<li>your human foundation is strong enough, but likely be dragged down over time by your incorporation;</li>";
      } else if (X_scored_level >= 2) {
          emailBody += "<li>your human foundation’s strength is marginal;</li>";
      } else {
          emailBody += "<li>your human foundation’s strength is too weak and will break under the load.</li>";
      }
      if (Z_scored_level >= 3 && Y_scored_level >= 3 && X_scored_level >= 3) {
          emailBody += "<li>You seem to be in the paradox between a desire to build a future-fit company, and the old paradigm of investor primacy! To get a more thorough assessment, and to get a plan on how you can use proven ways to transcend and integrate your polarities, with less stress for yourself, buy the follow-on consulting session.</li>\n";
      } else {
          emailBody += "<li>To get a more thorough assessment, and to get a plan on how you can use proven ways to up your game, with less stress for yourself, buy the follow-on consulting session.</li>\n";
      }
      emailBody += "</ul>";
  }

  emailBody += "\n\n";

  if (Z_self_assessment_level !== -1) {
    emailBody += "<ul>";
    if (Z_scored_level === Z_self_assessment_level) {
      emailBody += "<li>Your self-assessment of your level of incorporation and our initial automated evaluation are the same!</li>\n";
    } else if (Z_scored_level > Z_self_assessment_level) {
      emailBody += "<li>Your self-assessment of your level of incorporation is lower than our initial automated evaluation! Are you a little harsh on yourself at times?</li>\n";
    } else {
      emailBody += "<li>Your self-assessment of your level of incorporation is higher than our initial automated evaluation! Are you at risk of being surprised by your foundations breaking when you most need them?</li>\n";
    }
    emailBody += "</ul>";
  }

  if (Z_scored_level === 3 || Z_self_assessment_level === 3) {
    emailBody += "<p>Note that there is a range of companies we class as level 3. This diagnostic is not intended to distinguish between them. All of them are significant improvements over the standard company or cooperative, but fall short of the level of agency needed to support the new economic paradigm we need.</p>\n";
  }

  if (Y_self_assessment_level !== -1) {
    emailBody += "<ul>";
    if (Y_scored_level === Y_self_assessment_level) {
      emailBody += "<li>Your self-assessment of your work / organisation design level and our initial automated evaluation are the same!</li>\n";
    } else if (Y_scored_level > Y_self_assessment_level) {
      emailBody += "<li>Your self-assessment of your work / organisation design level is lower than our initial automated evaluation! Are you a little harsh on yourself at times?</li>\n";
    } else {
      emailBody += "<li>Your self-assessment of your work / organisation design level is higher than our initial automated evaluation! Are you at risk of being surprised by your work / organisation design foundations breaking when you most need them?</li>\n";
    }
    emailBody += "</ul>";
  }

  if (X_self_assessment_level !== -1) {
    emailBody += "<ul>";
    if (X_scored_level === X_self_assessment_level) {
      emailBody += "<li>Your self-assessment of your human foundation’s level and our initial automated evaluation are the same!</li>\n";
    } else if (X_scored_level > X_self_assessment_level) {
      emailBody += "<li>Your self-assessment of your human foundation’s level is lower than our initial automated evaluation! Are you a little harsh on yourself at times?</li>\n";
    } else {
      emailBody += "<li>Your self-assessment of your human foundation’s level is higher than our initial automated evaluation! Are you at risk of being surprised by your human foundations breaking when you most need them?</li>\n";
    }
    emailBody += "</ul>";
  }

  emailBody += "\n\n";
  emailBody += "<p>You can find more information about the incorporation dimension in my YouTube channel, especially in <a href='https://www.youtube.com/playlist?list=PL35xWnDyNa_97x7_I06ytop8Jg9PfGcDL'>this playlist</a> for entrepreneurs. You can also take <a href='https://www.evolutesix.com/regenerative-foundations-online'>this online course</a> and read about the three foundational dimensions in <a href='https://drive.google.com/file/d/1WB2nOdgdrcptWHKrd7jThnIUOtVqfNBV/view?usp=sharing'>this extract</a> from my book Rebuild the Economy, Leadership, and You.</p>\n\n";

  if (ergodicity_response === "Skill and effort are the primary drivers of business performance, business is a meritocracy. We only have robust ways of maximising the business outcomes of skill and effort") {
    emailBody += "<p>Regarding your approach to hedging against bad luck, and seizing the opportunities good luck brings, you’re leaving potential lying on the table, and are needlessly exposed to risk. You’re also likely to be mis-attributing outcomes of profit or loss to skills / effort being strong or weak respectively. So you may believe someone is good or no good, but they were just lucky or unlucky respectively. This is neither beneficial for you nor for your investors.</p>\n\n";
  } else if (ergodicity_response === "Both are important. We have robust ways of maximising the business outcomes of skill and effort, but little formal resource pooling with other companies and our investors to hedge against detrimental and for beneficial unpredictabilities") {
    emailBody += "<p>Regarding your approach to hedging against bad luck, and seizing the opportunities good luck brings, you have some understanding of the relationship between skill and effort on the one hand, and unpredictability on the other. But you only have strong foundations on the skills / effort side, not to maximise outcomes from unpredictability. So you’re leaving potential lying on the table, and are needlessly exposed to risk. You’re likely to be appropriately attributing outcomes of profit or loss to skills / effort vs. unpredictability (good or bad luck). But you could do much better with unpredictables! This improvement would be beneficial for you and for your investors.</p>\n\n";
  } else if (ergodicity_response === "Both are important. We have robust ways of maximising the business outcomes of skill and effort, and some resources are pooled with other companies and investors to hedge against detrimental and for beneficial unpredictabilities") {
    emailBody += "<p>Regarding your approach to hedging against bad luck, and seizing the opportunities good luck brings, you have an understanding of the relationship between skill and effort on the one hand, and unpredictability on the other. You have good foundations on both sides. But you could do even better with unpredictables! This improvement would be beneficial for you and for your investors.</p>\n\n";
  } else if (ergodicity_response === "Both are important. We have robust ways of maximising the business outcomes of skill and effort, and robust pooling mechanisms including profit pooling within a diverse ecosystem of multiple companies to hedge against detrimental and for beneficial unpredictabilities") {
    emailBody += "<p>You seem to have an excellent understanding of the relationship between skills / effort and unpredictability, which you seem to have used to build solid foundations to maximise the outcomes from each. Of course, there may well be areas where you can do even better!</p>\n\n";
  }

  if (theory_x_y_response === "people are inherently lazy and must be controlled, incentivised, and threatened") {
    emailBody += "<p>You also most likely have significant upside potential for better results by strengthening the way your foundations increase people’s inner motivations. This is well-proven, especially in volatile times, to lead to faster, more effective responses to events. And so delivers better outcomes for you and your investors.</p>\n\n";
  } else if (theory_x_y_response === "people are intrinsically self-motivated and creative") {
    emailBody += "<p>You’ve grasped the power of tapping into intrinsic motivation! ";
    if (Z_scored_level >= 4 && Y_scored_level >= 4 && X_scored_level >= 4) {
        emailBody += "And you seem to have built the right foundations to maximise people’s (and teams’) agency to maximise their intrinsic motivation and turn it into excellent results! Well done! Would you say no to a better way?</p>\n\n";
    } else if (Z_scored_level >= 1 && Y_scored_level >= 2 && X_scored_level >= 2) {
        emailBody += "And you seem to have built some foundations towards enabling people’s (and teams’) agency to maximise their intrinsic motivation and turn it into excellent results, but there are well-proven ways of building far more enabling foundations.</p>\n\n";
    } else {
        emailBody += "But you seem to have built foundations that fall short of what you need to really enable people’s (and teams’) agency to maximise their intrinsic motivation and turn it into excellent results. There are well-proven ways of building far more enabling foundations.</p>\n\n";
    }
  }

  if (growth_mindset_response === "you either are “good” at something or not - mostly people just cannot learn new things") {
    emailBody += "<p>Since you seem to believe that people can’t develop very much, regardless of the support given to them, you’re likely going to carry higher costs and higher risks as your business scales. Also, in the face of our ever more volatile and unpredictable world, slower reaction times and weaker innovation. You would be well served by asking yourself what has led to your beliefs about people, and how confident you are that they are absolutely true, everywhere and always, for everyone.</p>\n\n";
  } else if (growth_mindset_response === "you can learn pretty much anything - if you stick to ongoing training and have support from the organisation") {
    emailBody += "<p>Your beliefs about people’s capacity to develop in response to challenges, given the right support, are powerful enablers for success! So long as you put in place both ways of recognising each person’s development edge (including your own!) and the scaffolding each person needs, your chances of success are better than most!</p>\n\n";
  } else if (growth_mindset_response === "you can learn new things easily by yourself") {
    emailBody += "<p>Your beliefs about people’s capacity to develop in response to challenges are enablers for success. However, because you seem to expect them to do so without systemic support from the organisation you’re likely limiting development (yours as well) to the zone of self-supported development. To develop at one’s developmental edge requires both ways of recognising each person’s development edge (including your own!) and the scaffolding each person needs. Only if you do that will your chances of success be better than most!</p>\n\n";
  }

  if (technical_vs_adaptive_response === "all challenges can be overcome with perseverance and learning/hiring new skills, buying new technology") {
    emailBody += "<p>You seem to deal with challenges primarily through perseverance, trying harder, learning or hiring new skills, and buying new technology. This will lead to missed opportunities and additional risks as you scale, and when unpredictable challenges and opportunities arise. Because in these cases our identity, our beliefs about how the world works, are the primary limiting factors. For example, Kodak, Blackberry, and Blockbuster all failed in the face of disruption because their leadership identified with their business. And so could not change their business because they could not see the need to change themselves first. Don’t be another Kodak, Blackberry, or Blockbuster!</p>\n\n";
  } else if (technical_vs_adaptive_response === "some challenges can only be overcome if we change ourselves") {
    emailBody += "<p>Well done! You’ve recognised that some challenges require us to change our identity. To do so requires your work and human dimensions to enable sufficient agency, individually and collectively. Your work dimension scored " + Y_scored_level + ", " + Agency_name[Y_scored_level] + ". ";
    if (Y_scored_level >= 4) {
        emailBody += "This is likely good enough for your needs, and puts you in the top bracket globally! ";
    } else if (Y_scored_level >= 2) {
        emailBody += "This is better than most, but could still be improved! ";
    } else {
        emailBody += "This really ought to be improved as fast as you can! ";
    }
    emailBody += "Your human dimension your score is: " + X_scored_level + " " + Agency_name[X_scored_level] + ". ";
    if (X_scored_level >= 4) {
        emailBody += "This is likely good enough for your needs, and puts you in the top bracket globally! ";
    } else if (X_scored_level >= 2) {
        emailBody += "This is better than most, but could still be improved! ";
    } else {
        emailBody += "This really ought to be improved as fast as you can! ";
    }
    if (X_scored_level < 4 || Y_scored_level < 4) {
        emailBody += "Improvement is especially important for the growing volatility and unpredictability we’re already experiencing, and that we expect to increase with time.</p>\n\n";
    }
  }

  emailBody += `<p>${R_first_name}, there’s a lot more you can get out of the data you’ve given us in a strategic dialogue. We’ve heard time and time again from other people in your ${R_role} role “I didn’t even know that that was possible”. If you’re sure that nothing of value can come from one initial consulting session with us, then we in Evolutesix wish you all success, and hope to read good news about you one day in the headlines! Otherwise <a href="https://www.evolutesix.com/legal-od-strong-enough">take our initial consulting session</a>.</p>\n\n`;

  emailBody += "<p>Thank you for your time filling in this assessment!</p>\n";
  if (feedback_comments.length > 0) {
    emailBody += "<p>We appreciate the feedback you have already given us while filling in the form. We’d love to hear more from you, especially if you have any questions, or any additional feedback on the assessment itself or this email.</p>\n";
  } else {
    emailBody += "<p>We’d love to hear from you, especially if you have any questions, or any feedback on the assessment itself or this email.</p>\n";
  }

  emailBody += "<hr><h3>Debug Information</h3>";
  emailBody += "<h4>Constants:</h4>";
  emailBody += `<p>R_first_name: ${R_first_name}</p>`;
  emailBody += `<p>R_last_name: ${R_last_name}</p>`;
  emailBody += `<p>R_company_name: ${R_company_name}</p>`;
  emailBody += `<p>R_role: ${R_role}</p>`;
  emailBody += `<p>R_business_intent: ${R_business_intent}</p>`;
  emailBody += `<p>R_sector: ${R_sector}</p>`;
  emailBody += `<p>R_exit_strategy: ${R_exit_strategy}</p>`;
  emailBody += `<p>R_incorporated_flag: ${R_incorporated_flag}</p>`;
  emailBody += `<p>Agency_name: ${JSON.stringify(Agency_name)}</p>`;
  emailBody += `<p>R_DAO_flag: ${R_DAO_flag}</p>`;
  emailBody += `<p>DAO_form: ${DAO_form}</p>`;
  emailBody += `<p>R_only_self_assessment_flag: ${R_only_self_assessment_flag}</p>`;
  emailBody += `<p>Z_self_assessment_text: ${Z_self_assessment_text}</p>`;
  emailBody += `<p>Z_self_assessment_level: ${Z_self_assessment_level}</p>`;
  emailBody += `<p>Y_self_assessment_text_long: ${Y_self_assessment_text_long}</p>`;
  emailBody += `<p>Y_self_assessment_text: ${Y_self_assessment_text}</p>`;
  emailBody += `<p>Y_self_assessment_level: ${Y_self_assessment_level}</p>`;
  emailBody += `<p>X_self_assessment_text_long: ${X_self_assessment_text_long}</p>`;
  emailBody += `<p>X_self_assessment_text: ${X_self_assessment_text}</p>`;
  emailBody += `<p>X_self_assessment_level: ${X_self_assessment_level}</p>`;
  emailBody += "<h4>Variables:</h4>";
  emailBody += `<p>Y_running_total: ${Y_running_total}</p>`;
  emailBody += `<p>X_running_total: ${X_running_total}</p>`;
  emailBody += `<p>z_level_scores: ${JSON.stringify(z_level_scores)}</p>`;
  emailBody += `<p>Z_scored_level: ${Z_scored_level}</p>`;
  emailBody += `<p>Y_scored_level: ${Y_scored_level}</p>`;
  emailBody += `<p>X_scored_level: ${X_scored_level}</p>`;
  emailBody += `<p>R_only_incorporation_flag: ${R_only_incorporation_flag}</p>`;

  emailBody += "<hr><h3>Questions:</h3>";
  itemResponses.forEach(itemResponse => {
    emailBody += `<p>[${itemResponse.getItem().getTitle()}]</p>`;
  });


  // Send email
  const recipient = e.response.getRespondentEmail();
  Logger.log("recipient: " + recipient);
  Logger.log("subject: " + subject);
  Logger.log("emailBody length: " + emailBody.length);
  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    htmlBody: emailBody
  });
  Logger.log("Email sent to " + recipient);
}
