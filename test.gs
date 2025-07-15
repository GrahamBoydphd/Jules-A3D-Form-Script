function testAllScenarios() {
  // Test Case 1: Self-assessment only
  const mockEvent1 = {
    response: {
      getItemResponses: () => [
        { getItem: () => ({ getTitle: () => "Do you want to go on to the more detailed health check of the actual strength of your incorporation? If you want to end here, at the self-assessment, choose no." }), getResponse: () => "No, I want only the self-assessment" }
      ],
      getRespondentEmail: () => "test1@example.com"
    }
  };
  runTest("Test Case 1: Self-assessment only", mockEvent1);

  // Test Case 2: Incorporation only
  const mockEvent2 = {
    response: {
      getItemResponses: () => [
        { getItem: () => ({ getTitle: () => "Do you want to go on to the more detailed health check of the actual strength of your incorporation? If you want to end here, at the self-assessment, choose no." }), getResponse: () => "Yes, I want to the detailed assessment of the incorporation dimension. After that I can choose to assess the work and human dimensions too. The incorporation assessment will take 5 to 10 minutes." },
        { getItem: () => ({ getTitle: () => "Do you want to also assess how fit for purpose your work and human structures and interactions are? If you want to end here, and only assess your incorporation, choose no." }), getResponse: () => "No, I want to focus only on incorporation" },
        { getItem: () => ({ getTitle: () => "If already incorporated, the company's incorporation form is a (choose the closest legal form in your jurisdiction). If not yet incorporated, choose the one you currently intend to use." }), getResponse: () => "A single stakeholder cooperative." },
        { getItem: () => ({ getTitle: () => "Is buying shares all that’s needed to get voting rights? (Voting rights come automatically with financial investment.)" }), getResponse: () => "No, there are additional criteria beyond financial investment to qualify to vote" },
      ],
      getRespondentEmail: () => "test2@example.com"
    }
  };
  runTest("Test Case 2: Incorporation only", mockEvent2);

  // Test Case 3: Full assessment
  const mockEvent3 = {
    response: {
      getItemResponses: () => [
        { getItem: () => ({ getTitle: () => "Do you want to go on to the more detailed health check of the actual strength of your incorporation? If you want to end here, at the self-assessment, choose no." }), getResponse: () => "Yes, I want to the detailed assessment of the incorporation dimension. After that I can choose to assess the work and human dimensions too. The incorporation assessment will take 5 to 10 minutes." },
        { getItem: () => ({ getTitle: () => "Do you want to also assess how fit for purpose your work and human structures and interactions are? If you want to end here, and only assess your incorporation, choose no." }), getResponse: () => "Yes, I want to assess all three dimensions of my company" },
        { getItem: () => ({ getTitle: () => "What kind of organisation design do you have? Choose the one that most closely describes what is happening in practice, not what may be written down." }), getResponse: () => "Self-Governing: individuals energise roles with high independent accountability, including the ability to change the role definition without approval from above (albeit with consent from other roles impacted by the proposed change)." },
        { getItem: () => ({ getTitle: () => "There are systems in place that encourage and support the orientation of all members of the organization along the strategic imperatives." }), getResponse: () => "4" },
        { getItem: () => ({ getTitle: () => "What kind of human development and culture do you have? Choose the one that most closely describes what is happening in practice, not what may be written down." }), getResponse: () => "Development is systemic: the company has gone beyond common practice, skills and whole person development happens continuously and systemically as an integral part of work." },
        { getItem: () => ({ getTitle: () => "X1: How is employee performance most often discussed or evaluated?" }), getResponse: () => "3" },
        { getItem: () => ({ getTitle: () => "Your exit strategy is:" }), getResponse: () => "Other", getOtherOptionResponse: () => "Custom Exit" },
        { getItem: () => ({ getTitle: () => "Are you using a DAO?" }), getResponse: () => "No." }
      ],
      getRespondentEmail: () => "test3@example.com"
    }
  };
  runTest("Test Case 3: Full assessment", mockEvent3);
}

function runTest(testName, mockEvent) {
  console.log(`Running ${testName}...`);
  try {
    onFormSubmit(mockEvent);
    console.log(`${testName} passed: onFormSubmit ran without errors.`);
  } catch (error) {
    console.error(`${testName} failed:`, error);
  }
}
