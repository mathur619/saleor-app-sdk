import NetInfo from "@react-native-community/netinfo";
import { ApolloClientManager } from "../data/ApolloClientManager";
import { LocalStorageHandler } from "../helpers/LocalStorageHandler";
import { IJobs, Jobs } from "./Jobs";
import { IQueuedJobs, QueuedJobs } from "./QueuedJobs";
import { JobFunctionParameters, QueuedJobFunctionParameters } from "./types";

export class JobsManager {
  private queue: Array<{
    jobGroup: string;
    jobName: string;
  }>;

  private readonly jobs: IJobs;

  private readonly localStorageHandler: LocalStorageHandler;

  private readonly queuedJobs: IQueuedJobs;

  private constructor(
    localStorageHandler: LocalStorageHandler,
    apolloClientManager: ApolloClientManager
  ) {
    this.queue = new Array<{
      jobGroup: string;
      jobName: string;
    }>();
    this.localStorageHandler = localStorageHandler;

    this.jobs = new Jobs(this.localStorageHandler, apolloClientManager);
    this.queuedJobs = new QueuedJobs(
      this.localStorageHandler,
      apolloClientManager
    );
  }

  static async create(
    localStorageHandler: LocalStorageHandler,
    apolloClientManager: ApolloClientManager
  ): Promise<JobsManager> {
    const jobsManager = new JobsManager(
      localStorageHandler,
      apolloClientManager
    );
    await jobsManager.enqueueAllSavedInRepository();

    const netInfo = await NetInfo.fetch();
    // Check if internet is available to run all jobs in queue
    if (netInfo.type !== "unknown" && netInfo.isInternetReachable === true) {
      await jobsManager.onOnline();
    }

    return jobsManager;
  }

  /**
   * Executes job immediately and returns result or error.
   * @param jobGroup - Job group name referencing to the class with job functions.
   * @param jobName - Jobs within group/class.
   * @param params - Object passed as the first argument to the job function.
   */
  run<G extends keyof IJobs, J extends keyof IJobs[G], P extends IJobs[G][J]>(
    jobGroup: G,
    jobName: J,
    params?: JobFunctionParameters<G, J, P>[0]
  ): any {
    const func = this.jobs[jobGroup][jobName];

    if (typeof func === "function") {
      return func(params);
    }

    return undefined;
  }

  /**
   * Add job to the queue. If there is an internet connection available, job is executed
   * immediately. Otherwise job is inserted into the queue and delayed until internet connection
   * will be restored. Queue is persisted in local storage.
   * @param jobGroup - Job group name referencing to the class with job functions.
   * @param jobName - Jobs within group/class.
   */
  addToQueue<G extends keyof IQueuedJobs, J extends keyof IQueuedJobs[G]>(
    jobGroup: G,
    jobName: J
  ): void {
    NetInfo.fetch()
      .then(state =>
        state.type !== "unknown" && state.isInternetReachable === true
          ? this.runJob(jobGroup, jobName)
          : this.enqueueJob(jobGroup, jobName)
      )
      .catch(netError => {
        throw netError;
      });
  }

  /**
   * Attach event listener to the job group.
   * @param jobGroup - Job group name referencing to the class with job functions.
   * @param onEventListener - Function to be called if event will occur during job execution.
   */
  attachEventListener<
    G extends keyof IJobs,
    P extends IJobs[G]["attachEventListener"]
  >(
    jobGroup: G,
    onEventListener: JobFunctionParameters<G, "attachEventListener", P>[0]
  ): void {
    const typedEventListener = onEventListener as P;

    this.jobs[jobGroup].attachEventListener(typedEventListener);
  }

  /**
   * Attach error listener to the queued job group.
   * @param jobGroup - Job group name referencing to the class with job functions.
   * @param onErrorListener - Function to be called if error will occur during job execution.
   */
  attachErrorListener<
    G extends keyof IQueuedJobs,
    P extends IQueuedJobs[G]["attachErrorListener"]
  >(
    jobGroup: G,
    onErrorListener: QueuedJobFunctionParameters<G, "attachErrorListener", P>[0]
  ): void {
    const typedErrorListener = onErrorListener as P;

    this.queuedJobs[jobGroup].attachErrorListener(typedErrorListener);
  }

  private async runJob<
    G extends keyof IQueuedJobs,
    J extends keyof IQueuedJobs[G]
  >(jobGroup: G, jobName: J): Promise<void> {
    const func = this.queuedJobs[jobGroup][jobName];

    if (typeof func === "function") {
      func();
    }

    await this.dequeueJob(jobGroup, jobName);
  }

  private async enqueueJob<
    G extends keyof IQueuedJobs,
    J extends keyof IQueuedJobs[G]
  >(jobGroup: G, jobName: J): Promise<void> {
    const methodName = jobName.toString();

    const jobAlreadyQueued = this.queue.some(
      item => item.jobGroup === jobGroup && item.jobName === jobName
    );

    if (!jobAlreadyQueued) {
      this.queue.push({ jobGroup, jobName: methodName });
      await this.updateJobStateInRepository(jobGroup, jobName, true);
    }
  }

  private async dequeueJob<
    G extends keyof IQueuedJobs,
    J extends keyof IQueuedJobs[G]
  >(jobGroup: G, jobName: J): Promise<void> {
    const methodName = jobName.toString();

    this.queue = this.queue.filter(
      item => item.jobGroup !== jobGroup || item.jobName !== methodName
    );

    await this.updateJobStateInRepository(jobGroup, jobName, false);
  }

  private onOnline = async (): Promise<void> => {
    for (const item of this.queue) {
      const jobGroup = item.jobGroup as keyof IQueuedJobs;
      const jobName = item.jobName as keyof QueuedJobs[keyof IQueuedJobs];

      // eslint-disable-next-line no-await-in-loop -- It's necessary to execute every job in order
      await this.runJob(jobGroup, jobName);
    }

    this.queue = [];
  };

  private async updateJobStateInRepository<
    G extends keyof IQueuedJobs,
    J extends keyof IQueuedJobs[G]
  >(jobGroup: G, jobName: J, state: boolean) {
    let jobs = await LocalStorageHandler.getJobs();

    if (!jobs) {
      jobs = null;
    }

    const jobGroupString = jobGroup.toString();
    const jobNameString = jobName.toString();

    const jobGroupObject = jobs ? jobs[jobGroup] : null;

    await this.localStorageHandler.setJobs({
      ...jobs,
      [jobGroupString]: {
        ...jobGroupObject,
        [jobNameString]: state,
      },
    });
  }

  private async enqueueAllSavedInRepository() {
    const jobs = await LocalStorageHandler.getJobs();

    if (jobs) {
      for (const jobGroupString of Object.keys(jobs)) {
        const jobGroupKey = jobGroupString as keyof IQueuedJobs;
        const jobGroup = jobs[jobGroupKey];

        if (jobGroup) {
          for (const jobNameString of Object.keys(jobGroup)) {
            const jobNameKey = jobNameString as keyof QueuedJobs[keyof IQueuedJobs];
            const jobNameState = jobGroup[jobNameKey];

            if (jobNameState) {
              this.addToQueue(
                jobGroupString as keyof IQueuedJobs,
                jobNameString as keyof QueuedJobs[keyof IQueuedJobs]
              );
            }
          }
        }
      }
    }
  }
}
