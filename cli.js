#!/usr/bin/env node

"use strict";
const linkLernaDependency = require("./");
const optionator = require("optionator");
const {resolve: resolvePath} = require("path");
const {version: packageVersion} = require("./package.json");



// @todo use npm@7 instead of lerna?: https://github.com/npm/npm/issues/19421
const createLinks = async ({pkgDir, pkgName}) =>
{
	const cwd = process.cwd();
	const logs = [];
	let error, globalLog;
	pkgDir = resolvePath(pkgDir);

	try
	{
		await linkLernaDependency(
		{
			cwd,
			onGlobalLinkCreated: log => globalLog = log,
			onLinkCreated: log => logs.push(log),
			pkgDir,
			pkgName
		});
	}
	catch (err)
	{
		error = err;
		process.exitCode = 1;
	}
	finally
	{
		console.log(globalLog);

		// Complete or incomplete list of successful links
		logs
			.sort()
			.forEach(location => console.log(location));

		if (error)
		{
			console.error(error);
		}
	}
};



const getOptions = () =>
{
	const o = optionator(
	{
		prepend: "Usage: lerna-link-deps [options]",
		options:
		[
			{ heading:"Required options" },
			{ option:"pkgDir",  type:"String", description:"The target directory of the linked packaged.", required:true },
			{ option:"pkgName", type:"String", description:"The package name; @scope supported.",          required:true },

			{ heading:"Other options" },
			{ option:"help",    alias:"h", type:"Boolean", description:"Display this help text",      overrideRequired:true },
			{ option:"version", alias:"v", type:"Boolean", description:"Display the release version", overrideRequired:true }
		]
	});

	let options;

	try
	{
		options = o.parseArgv(process.argv);
	}
	catch ({message})
	{
		console.error(message);
		process.exitCode = 1;
	}

	if (options?.help)
	{
		console.log( o.generateHelp() );
	}
	else if (options?.version)
	{
		console.log(packageVersion);
	}
	else if (options)
	{
		return options;
	}
};



const run = async () =>
{
	const options = getOptions();

	if (options)
	{
		await createLinks(options);
	}
};



run();
