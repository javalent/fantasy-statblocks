<!-- omit in toc -->
# Contributing to Fantasy Statblocks

First off, thanks for taking the time to contribute. ❤️

We encourage and value all types of contributions.
You can find different ways
to help and details about how this project handles them in the [Table of Contents](CONTRIBUTING.md#table-of-contents). Make sure to read the relevant section before making your contribution.
This will help us maintainers and make the experience smoother for everyone involved.
The community is excited to see your contributions. 🎉.

> If you like the project but don't have the time to contribute, there are other ways to show your support and appreciation that we would be happy about:
> - Star the project
> - Spread the word and tell others about it
> - Mention the project in your own projects readme
> - Continue using the project and give us feedback

<!-- omit in toc -->
## Table of Contents

- [Code of Conduct](CONTRIBUTING.md#code-of-conduct)
- [I've a Question](CONTRIBUTING.md#ive-a-question)
- [I Want To Contribute](CONTRIBUTING.md#i-want-to-contribute)
- [Reporting Bugs](CONTRIBUTING.md#reporting-bugs)
- [Suggesting Enhancements](CONTRIBUTING.md#suggesting-enhancements)
- [Your First Code Contribution](CONTRIBUTING.md#your-first-code-contribution)
- [Improving The Documentation](CONTRIBUTING.md#improving-the-documentation)
- [Styleguides](CONTRIBUTING.md#styleguide)
- [Commit Messages](CONTRIBUTING.md#commit-messages)
- [Join The Project Team](CONTRIBUTING.md#join-the-project-team)


## Code of Conduct

The Fantasy Statblocks Code of Conduct [governs these project and everyone participating in it](https://github.com/javalent/fantasy-statblocks/CODE_OF_CONDUCT.md).
By participating, you're expected to, and agreeing to, uphold this code.


## I've a Question

> If you want to ask a question, we assume that you've read the available [Documentation](https://plugins.javalent.com/statblocks).

Before you ask a question,
it is best to search for existing [Issues](https://github.com/javalent/fantasy-statblocks/issues) that might help you. 
In case you've found a suitable issue and still need clarification, you can write your question in this issue. 
It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Open an [Issue](https://github.com/javalent/fantasy-statblocks/issues/).
- Code your issue appropriately with one of the four labels. When in doubt, use 'bug'.
- Provide as much context as you can about what you're running into.

We will then take care of the issue as soon as possible.

## I Want To Contribute

> ### Legal Notice <!-- omit in toc -->
> When contributing to this project, you agree that you've authored 100% of the content, that you've the necessary rights to the content and that the content you contribute may be provided under the project licence.

### Reporting Bugs

<!-- omit in toc -->
#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more information.
Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report.
Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you're using the latest version of Obsidian, including which you have installer version 1.1.9 or newer.
- Determine if your bug is really a bug and not an error on your side, for example, using incompatible environment components/versions or have plugin interactions (Make sure that you've read the [documentation](https://plugins.javalent.com/statblocks). If you're looking for support, you might want to check [this section](CONTRIBUTING.md#ive-a-question)).
- To see if other users have experienced (and potentially already solved) the same issue you're having, check if there isn't already a bug report existing for your bug or error in the [bug tracker](https://github.com/javalent/fantasy-statblocks/issues?q=label%3Abug).
- Also make sure to search the internet (including Obsidian Discord) to see if users outside the GitHub community have discussed the issue.
- Collect information about the bug:
- Error Codes (Traceback)
- OS, Platform and Version (Windows, Linux, macOS, x86, ARM)
- Version of the Obsidian, version of the plugin, how you installed it, your other plugins and what else you think seems relevant.
- Possibly a copy of your `note.md` and possibly the plugins `data.json` file.
- Can you reliably reproduce the issue?

<!-- omit in toc -->
#### How Do I Submit a Good Bug Report?

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](https://github.com/javalent/fantasy-statblocks/issues/new) and select the Bug Template.
- Explain the expected behavior and the actual behavior. 
- Provide as much context as possible, including reproduction steps that someone else can follow to recreate the issue on their own. This should include your code, and for better bug reports, isolate the problem and create a reduced test case. 
- Include any relevant information you collected previously. 
- Answer all questions on the issue template as accurately as possible.

After submitting your bug report, our team will take the following steps:

- Label the issue according to its severity.
- Attempt to reproduce the issue using the steps provided. If the issue can't be reproduced, we may ask you for additional information and mark the issue as “discovery”.
- If the issue can be reproduced, it will be re-prioritized and possibly have other tags added, and left for [someone](#your-first-code-contribution) to implement the solution.


### Suggesting Features

This section guides you through submitting an enhancement suggestion for Fantasy Statblocks,
**including completely new features and minor improvements to existing functionality**.
Following these guidelines will help maintainers,
and the community is to understand your suggestion and find related suggestions.

<!-- omit in toc -->
#### Before Submitting an Enhancement

- Make sure that you're using the latest version of Obsidian and that your installer version is 1.2.5 or newer.
- Read the [documentation](https://plugins.javalent.com/statblocks) carefully and find out if the functionality is already covered, maybe by an individual configuration.
- Perform a [search](https://github.com/javalent/fantasy-statblocks/issues) to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
- Consider posting in the [Ideas section](https://github.com/javalent/fantasy-statblocks/discussions/categories/ideas) of the Discussion Forum for communal vetting of your idea. 
- Additionally, find out whether your idea fits with the scope and aims of the project. It is up to you to make a strong case to convince the project's developers the merits of this feature. Keep in mind that we want features that will be useful to most of our users and not a small subset. If you're targeting a small number of users, consider writing an add-on/plugin library to be added in.

<!-- omit in toc -->
#### How Do I Submit a Good Enhancement Suggestion?

Feature suggestions are tracked as [GitHub issues](https://github.com/javalent/fantasy-statblocks/issues).

- Ensure that the issue title is clear and descriptive, accurately reflecting the suggestion being made.
- Provide a detailed step-by-step description of the suggested enhancement, including as much relevant information as possible.
- State the current behavior, and explain what behavior you expected to see instead and why. You may also wish to mention any alternatives that've been considered.
- Consider including screenshots or animated GIFs to demonstrate the steps or highlight the relevant part of the project. Tools such as LiceCap (for macOS and Windows) or Silentcast and Byzanz (for Linux) may be helpful. (Note: this only applies if the project has a GUI.)
- Explain how the suggested enhancement would benefit most Fantasy Statblocks users. You may also want to provide examples of other projects that've successfully implemented similar features for inspiration.


### Your First Code Contribution

### Building the Project

#### Building from Source

Once you've installed your desired plugin, you can use `npm` to build new `main.js` and `styles.css` files from the source:

1. Open your terminal and navigate to the `source directory`, then run `npm install`.
2. Trigger `npm run build` to generate the `main.js` and `styles.css` files inside the `source directory`.
3. Go to the appropriate `javalent-plugin` folder located in your vault's plugins directory, and replace the existing `main.js` and `styles.css` files with the newly generated ones.
4. To start using the new files, reload Obsidian. 
   4.a. If you have the [Hot-Reload](https://github.com/pjeby/hot-reload) Obsidian plugin installed,
   the reload process will be automated for you.

#### Building from .env

Alternatively, you can use the `npm run dev` command for a more streamlined workflow after setting up your `.env` file:

1. Create a file called .env in the source directory.
2. Add the following line to the file: `OUTDIR="/absolute/path/to/your/vault/.obsidian/plugins/plugin-name"`. For example, we would use `OUTDIR="/absolute/path/to/your/vault/.obsidian/plugins/fantasy-calendar"` if we're working on the Fantasy Calendar plugin. 
3. Run npm run dev in the source directory to build the `main.js` and `styles.css` files, and place them in the folder you specified in your `.env` file.
4. Whenever you save changes, the dev script will automatically rebuild those files.

### Improving The Documentation
- Do you see any areas of documentation that seem confusing or unclear?
- Do you see a section that you want to expand on?
- Do you want to add a funny note, a song or a sarcastic vibe?

Create a [[Github Policies|Github Issue]] in the appropriate documentation repository stating what you think should change. If you're creating an Issue on how you would like to contribute, please include two sample paragraphs of your writing.

- **1st Sample**: *Narrative/Storytelling Writing*. Much of the documentation mixes between using metaphor and analogy to explain concepts that would otherwise not qualify as beginner-friendly.
- **2nd Sample**: *Technical Writing*. In certain cases, we do revert to Technical Writing, which is formalized and micromanaged. When writing in this way, anyone can perform these steps and reach the result.

Both can be freestyle. It could at first be a storytelling guide about how to cook, and then a technical recipe about making a good sandwich. Have fun with it. These samples aren't a test or to judge, but an ***introduction to you***. We will never say no to help.

## Styleguide

### Commit Messages
This repository uses Semver style commit messages, specifically from [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). This requirement exists to **faciliate automated versioning and changelog generation**. We don't expect perfection, but do your best to get comfortable with these conventions if you're not familiar with them.

## Join The Project Team
Want to officially join the project? Message javalent#3452 on Discord. 

<!-- omit in toc -->
## Attribution
This guide is based on the **[contributing-gen](https://github.com/bttger/contributing-gen)** and was edited further by @Sigrunixia and @Javalent.
