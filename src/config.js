module.exports = {
  providers: {
    bitrise: {
      name: 'Bitrise',
      baseUrl: 'https://devcenter.bitrise.io',
      docs: [
        '/en/api/api-reference.html',
        '/en/builds/starting-builds-manually.html',
        '/en/builds/build-logs.html',
        '/en/workflows/workflow-editor.html',
        '/en/steps-workflows/introduction-to-steps.html',
        '/en/testing/android-run-a-unit-test.html',
        '/en/testing/ios-run-xcode-tests.html',
        '/en/deploy/android-deploy.html',
        '/en/deploy/ios-deploy.html',
        '/en/code-signing/android-code-signing.html',
        '/en/code-signing/ios-code-signing.html'
      ]
    },
    codemagic: {
      name: 'Codemagic',
      baseUrl: 'https://docs.codemagic.io',
      docs: [
        '/rest-api/codemagic-rest-api/',
        '/yaml-basic-configuration/yaml-getting-started/',
        '/yaml-basic-configuration/building-a-native-android-app/',
        '/yaml-basic-configuration/building-a-native-ios-app/',
        '/yaml-basic-configuration/building-a-flutter-app/',
        '/yaml-basic-configuration/building-a-react-native-app/',
        '/testing/aws-device-farm-integration/',
        '/publishing/publishing-to-google-play/',
        '/publishing/publishing-to-app-store/',
        '/code-signing/ios-code-signing/',
        '/code-signing/android-code-signing/'
      ]
    },
    circleci: {
      name: 'CircleCI',
      baseUrl: 'https://circleci.com/docs',
      docs: [
        '/api/v2/index.html',
        '/android/',
        '/ios/',
        '/testing-ios/',
        '/testing-android/',
        '/deploy-android-to-google-play/',
        '/deploy-ios-to-testflight/',
        '/parallelism-faster-jobs/',
        '/workflows/',
        '/orbs-intro/',
        '/configuration-reference/'
      ]
    },
    'github-actions': {
      name: 'GitHub Actions',
      baseUrl: 'https://docs.github.com/en/actions',
      docs: [
        '/quickstart',
        '/using-workflows',
        '/using-jobs',
        '/using-workflows/workflow-syntax-for-github-actions',
        '/deployment/deploying-to-google-kubernetes-engine',
        '/deployment/deploying-to-amazon-elastic-container-service',
        '/automating-builds-and-tests/building-and-testing-nodejs',
        '/automating-builds-and-tests/building-and-testing-python',
        '/security-guides/encrypted-secrets',
        '/hosting-your-own-runners'
      ]
    },
    'gitlab-ci': {
      name: 'GitLab CI',
      baseUrl: 'https://docs.gitlab.com/ci',
      docs: [
        '/mobile_devops/',
        '/mobile_devops/mobile_devops_tutorial_ios/',
        '/examples/',
        '/yaml/',
        '/pipelines/',
        '/jobs/',
        '/variables/',
        '/runners/',
        '/environments/',
        '/secrets/'
      ]
    },
    appcircle: {
      name: 'Appcircle',
      baseUrl: 'https://docs.appcircle.io',
      docs: [
        '/getting-started-with-appcircle',
        '/build/build-process-management/build-profile-configuration',
        '/build/build-process-management/build-profile-branch-operations',
        '/build/platform-build-guides/building-ios-applications',
        '/build/platform-build-guides/building-android-applications',
        '/build/post-build-operations/after-a-build',
        '/distribute/create-or-select-a-distribution-profile',
        '/distribute/testing-portal',
        '/signing-identities/ios-signing-identities',
        '/signing-identities/android-signing-identities'
      ]
    },
    'azure-devops': {
      name: 'Azure DevOps',
      baseUrl: 'https://learn.microsoft.com/en-us/azure/devops',
      docs: [
        '/pipelines/ecosystems/android',
        '/pipelines/apps/mobile/app-signing',
        '/pipelines/yaml-schema',
        '/pipelines/process/variables',
        '/pipelines/agents/agents',
        '/pipelines/artifacts/artifacts',
        '/pipelines/release/releases',
        '/pipelines/test/test-analytics',
        '/pipelines/security/secrets',
        '/pipelines/integrations/slack'
      ]
    },
    jenkins: {
      name: 'Jenkins',
      baseUrl: 'https://www.jenkins.io',
      docs: [
        '/solutions/android/',
        '/doc/book/installing/',
        '/doc/book/using/',
        '/doc/book/pipeline/',
        '/doc/book/blueocean/',
        '/doc/book/managing/',
        '/doc/book/system-administration/',
        '/doc/book/security/',
        '/doc/book/glossary/',
        '/doc/developer/'
      ]
    },
    'xcode-cloud': {
      name: 'Xcode Cloud',
      baseUrl: 'https://developer.apple.com',
      docs: [
        '/xcode-cloud/',
        '/xcode-cloud/get-started/',
        '/xcode-cloud/security/',
        '/xcode-cloud/release-notes/',
        '/documentation/Xcode/Xcode-Cloud/',
        '/documentation/Xcode/',
        '/support/xcode-cloud/',
        '/system-status/',
        '/app-store-connect/api/',
        '/testflight/'
      ]
    },
    'firebase-app-distribution': {
      name: 'Firebase App Distribution',
      baseUrl: 'https://firebase.google.com/docs/app-distribution',
      docs: [
        '/android/distribute-cli',
        '/android/distribute-console',
        '/android/distribute-gradle',
        '/android/distribute-fastlane',
        '/ios/distribute-cli',
        '/ios/distribute-console',
        '/ios/distribute-fastlane',
        '/best-practices-distributing-android-apps-to-qa-testers-with-ci-cd',
        '/manage-testers',
        '/troubleshooting'
      ]
    }
  }
};